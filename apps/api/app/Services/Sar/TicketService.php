<?php

namespace App\Services\Sar;

use App\Models\AuditLog;
use App\Models\Ticket;
use App\Models\TicketEvent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TicketService
{
    /**
     * BE-SAR-03: Ambil daftar tiket perbaikan berpaginasi.
     */
    public function listTickets(array $filters, Request $request): LengthAwarePaginator
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $query = Ticket::with(['reporter:id,username', 'assignee:id,username', 'room', 'asset', 'photoFile'])
            ->orderBy('created_at', 'desc');

        if (! $this->isManagerOrTechnician($user)) {
            // Pelapor umum hanya dapat melihat tiket yang dilaporkannya
            $query->where('reporter_id', $user->id);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (! empty($filters['room_id'])) {
            $query->where('room_id', $filters['room_id']);
        }

        if (! empty($filters['asset_id'])) {
            $query->where('asset_id', $filters['asset_id']);
        }

        if (! empty($filters['assignee_id'])) {
            $query->where('assignee_id', $filters['assignee_id']);
        }

        if (! empty($filters['reporter_id']) && $this->isManagerOrTechnician($user)) {
            $query->where('reporter_id', $filters['reporter_id']);
        }

        if (! empty($filters['search'])) {
            $kw = '%'.strtolower($filters['search']).'%';
            $query->where(function ($q) use ($kw) {
                $q->whereRaw('LOWER(title) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(ticket_number) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(description) LIKE ?', [$kw]);
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * BE-SAR-03: Ambil detail tiket beserta riwayat timeline perbaikan.
     */
    public function getTicket(string $id, Request $request): Ticket
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $ticket = Ticket::with([
            'reporter:id,username',
            'assignee:id,username',
            'room',
            'asset',
            'photoFile',
            'events.actor:id,username',
            'events.file',
        ])->findOrFail($id);

        if (! $this->isManagerOrTechnician($user) && $ticket->reporter_id !== $user->id && $ticket->assignee_id !== $user->id) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang melihat tiket perbaikan ini.');
        }

        return $ticket;
    }

    /**
     * BE-SAR-03: Laporkan tiket kerusakan baru.
     */
    public function createTicket(array $data, Request $request): Ticket
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $ticketNumber = $this->generateTicketNumber();

        $ticket = DB::transaction(function () use ($data, $user, $ticketNumber) {
            $ticket = Ticket::create([
                'school_id' => $data['school_id'] ?? null,
                'ticket_number' => $ticketNumber,
                'title' => $data['title'] ?? ('Laporan Kerusakan '.Carbon::now()->format('d/m/Y')),
                'reporter_id' => $user->id,
                'room_id' => $data['room_id'] ?? null,
                'asset_id' => $data['asset_id'] ?? null,
                'description' => $data['description'],
                'priority' => $data['priority'] ?? 'sedang',
                'status' => 'pending',
                'photo_file_id' => $data['photo_file_id'] ?? null,
            ]);

            TicketEvent::create([
                'ticket_id' => $ticket->id,
                'actor_id' => $user->id,
                'event_type' => 'lapor',
                'note' => 'Tiket perbaikan dibuat dan menunggu disposisi.',
                'file_id' => $data['photo_file_id'] ?? null,
                'created_at' => Carbon::now(),
            ]);

            return $ticket;
        });

        $this->logAudit($user->id, 'ticket.create', 'tickets', $ticket->id, null, $ticket->toArray(), $request);

        return $ticket->fresh(['reporter:id,username', 'room', 'asset', 'photoFile', 'events']);
    }

    /**
     * BE-SAR-03: Disposisi penugasan tiket ke teknisi.
     */
    public function disposeTicket(string $id, array $data, Request $request): Ticket
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $ticket = Ticket::findOrFail($id);
        $oldAssignee = $ticket->assignee_id;
        $oldStatus = $ticket->status;

        $ticket = DB::transaction(function () use ($ticket, $data, $user) {
            $ticket->assignee_id = $data['assignee_id'];
            if ($ticket->status === 'pending') {
                $ticket->status = 'diproses';
            }
            $ticket->save();

            TicketEvent::create([
                'ticket_id' => $ticket->id,
                'actor_id' => $user->id,
                'event_type' => 'disposisi',
                'note' => $data['note'] ?? 'Tiket didisposisikan kepada teknisi.',
                'created_at' => Carbon::now(),
            ]);

            return $ticket;
        });

        $this->logAudit(
            $user->id,
            'ticket.dispose',
            'tickets',
            $ticket->id,
            ['assignee_id' => $oldAssignee, 'status' => $oldStatus],
            ['assignee_id' => $ticket->assignee_id, 'status' => $ticket->status],
            $request
        );

        return $ticket->fresh(['reporter:id,username', 'assignee:id,username', 'room', 'asset', 'events.actor:id,username']);
    }

    /**
     * BE-SAR-03: Perbarui status tiket dan catatan hasil perbaikan.
     */
    public function updateStatus(string $id, array $data, Request $request): Ticket
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $ticket = Ticket::findOrFail($id);

        $canUpdate = $this->isManagerOrTechnician($user) || $ticket->assignee_id === $user->id;
        if (! $canUpdate) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang memperbarui status tiket ini.');
        }

        $oldStatus = $ticket->status;
        $targetStatus = $data['status'];

        $ticket = DB::transaction(function () use ($ticket, $data, $user, $targetStatus) {
            $ticket->status = $targetStatus;
            if ($targetStatus === 'selesai') {
                $ticket->resolved_at = Carbon::now();
            }
            $ticket->save();

            $eventType = $targetStatus === 'selesai' ? 'selesai' : 'proses';
            TicketEvent::create([
                'ticket_id' => $ticket->id,
                'actor_id' => $user->id,
                'event_type' => $eventType,
                'note' => $data['note'] ?? "Status tiket diubah menjadi {$targetStatus}.",
                'file_id' => $data['file_id'] ?? null,
                'created_at' => Carbon::now(),
            ]);

            return $ticket;
        });

        $this->logAudit(
            $user->id,
            'ticket.status',
            'tickets',
            $ticket->id,
            ['status' => $oldStatus],
            ['status' => $ticket->status, 'resolved_at' => $ticket->resolved_at],
            $request
        );

        return $ticket->fresh(['reporter:id,username', 'assignee:id,username', 'room', 'asset', 'events.actor:id,username', 'events.file']);
    }

    /**
     * BE-SAR-03: Tambahkan komentar/catatan progres pada tiket.
     */
    public function addComment(string $id, array $data, Request $request): TicketEvent
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $ticket = Ticket::findOrFail($id);

        $canComment = $this->isManagerOrTechnician($user) || $ticket->reporter_id === $user->id || $ticket->assignee_id === $user->id;
        if (! $canComment) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang menambahkan komentar pada tiket ini.');
        }

        $event = TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_id' => $user->id,
            'event_type' => 'komentar',
            'note' => $data['note'],
            'file_id' => $data['file_id'] ?? null,
            'created_at' => Carbon::now(),
        ]);

        return $event->fresh(['actor:id,username', 'file']);
    }

    protected function generateTicketNumber(): string
    {
        $prefix = 'TCK-'.Carbon::now()->format('Ym');
        $countToday = Ticket::where('ticket_number', 'LIKE', "{$prefix}-%")->count();
        $sequence = str_pad((string) ($countToday + 1), 4, '0', STR_PAD_LEFT);

        return "{$prefix}-{$sequence}";
    }

    protected function isManagerOrTechnician(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('admin') ||
            $user->hasRole('super_admin') ||
            $user->hasRole('facility_staff') ||
            $user->hasRole('sarpras') ||
            $user->hasRole('technician') ||
            $user->hasRole('teknisi') ||
            $user->hasPermission('facility.asset.manage') ||
            $user->hasPermission('facility.booking.manage');
    }

    protected function authorizeManage(?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $canManage = $user->hasRole('admin') ||
            $user->hasRole('super_admin') ||
            $user->hasRole('facility_staff') ||
            $user->hasRole('sarpras') ||
            $user->hasPermission('facility.asset.manage');

        if (! $canManage) {
            throw new HttpException(403, 'Akses ditolak: Hanya Staf Sarpras atau Administrator yang berwenang mendisposisikan tiket.');
        }
    }

    protected function logAudit(?string $actorId, string $action, string $entity, ?string $entityId, ?array $oldValue, ?array $newValue, Request $request): void
    {
        try {
            AuditLog::create([
                'actor_id' => $actorId,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId,
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Audit log failure must not fail the transaction
        }
    }
}
