<?php

namespace App\Services\Sar;

use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Facility;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class BookingService
{
    /**
     * BE-SAR-01: Cek ketersediaan fasilitas real-time.
     */
    public function checkAvailability(array $params): array
    {
        $facilityId = $params['facility_id'];
        $facility = Facility::with('room')->findOrFail($facilityId);

        $query = Booking::where('facility_id', $facilityId)
            ->where('status', 'disetujui')
            ->orderBy('start_at', 'asc');

        $isAvailable = true;
        $conflicts = [];

        if (! empty($params['start_at']) && ! empty($params['end_at'])) {
            $startAt = Carbon::parse($params['start_at']);
            $endAt = Carbon::parse($params['end_at']);

            $conflicts = (clone $query)->where('start_at', '<', $endAt)
                ->where('end_at', '>', $startAt)
                ->with(['requester:id,username'])
                ->get();

            $isAvailable = $conflicts->isEmpty();
        }

        $dayBookings = [];
        if (! empty($params['date'])) {
            $date = Carbon::parse($params['date']);
            $dayBookings = (clone $query)->whereDate('start_at', $date->toDateString())
                ->with(['requester:id,username'])
                ->get();
        }

        return [
            'facility' => [
                'id' => $facility->id,
                'name' => $facility->name,
                'facility_type' => $facility->facility_type,
                'capacity' => $facility->capacity,
                'requires_approval' => $facility->requires_approval,
            ],
            'is_available' => $isAvailable,
            'conflicts' => $conflicts,
            'day_bookings' => $dayBookings,
        ];
    }

    /**
     * BE-SAR-01: Ambil daftar peminjaman fasilitas dengan peranan dan filter.
     */
    public function listBookings(array $filters, Request $request): LengthAwarePaginator
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $query = Booking::with(['facility.room', 'requester', 'decider', 'items.facility'])
            ->orderBy('start_at', 'desc');

        if (! $this->isManager($user)) {
            // Pengguna umum hanya dapat melihat riwayat booking miliknya
            $query->where('requested_by', $user->id);
        }

        if (! empty($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('start_at', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('start_at', '<=', $filters['to_date']);
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * BE-SAR-01: Ambil detail peminjaman dengan validasi akses.
     */
    public function getBooking(string $id, Request $request): Booking
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $booking = Booking::with(['facility.room', 'requester', 'decider', 'items.facility'])
            ->findOrFail($id);

        if (! $this->isManager($user) && $booking->requested_by !== $user->id) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki akses melihat detail peminjaman ini.');
        }

        return $booking;
    }

    /**
     * BE-SAR-01: Pengajuan peminjaman fasilitas dengan deteksi bentrok jadwal.
     */
    public function createBooking(array $data, Request $request): Booking
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $facility = Facility::findOrFail($data['facility_id']);
        $startAt = Carbon::parse($data['start_at']);
        $endAt = Carbon::parse($data['end_at']);

        if ($startAt->gte($endAt)) {
            throw new HttpException(422, 'Waktu mulai harus lebih awal dari waktu selesai peminjaman.');
        }

        // Deteksi bentrok jadwal dengan peminjaman yang telah disetujui
        $conflict = Booking::where('facility_id', $facility->id)
            ->where('status', 'disetujui')
            ->where('start_at', '<', $endAt)
            ->where('end_at', '>', $startAt)
            ->exists();

        if ($conflict) {
            throw new HttpException(422, 'Fasilitas tidak tersedia pada jadwal yang dipilih karena telah disetujui peminjaman lain (bentrok jadwal).');
        }

        $initialStatus = $facility->requires_approval ? 'diajukan' : 'disetujui';

        $booking = DB::transaction(function () use ($facility, $user, $startAt, $endAt, $data, $initialStatus) {
            $booking = Booking::create([
                'facility_id' => $facility->id,
                'requested_by' => $user->id,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'purpose' => $data['purpose'],
                'status' => $initialStatus,
                'decided_by' => $initialStatus === 'disetujui' ? $user->id : null,
            ]);

            if (! empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    BookingItem::create([
                        'booking_id' => $booking->id,
                        'facility_id' => $item['facility_id'],
                        'quantity' => $item['quantity'] ?? 1,
                        'notes' => $item['notes'] ?? null,
                    ]);
                }
            }

            return $booking;
        });

        $this->logAudit($user->id, 'booking.create', 'bookings', $booking->id, null, $booking->toArray(), $request);

        return $booking->fresh(['facility.room', 'requester', 'items.facility']);
    }

    /**
     * BE-SAR-01: Keputusan persetujuan atau penolakan oleh staf Sarpras/Admin.
     */
    public function decideBooking(string $id, array $data, Request $request): Booking
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $oldStatus = null;
        $booking = DB::transaction(function () use ($id, $data, $user, &$oldStatus) {
            // SEC-CONC-01: Pessimistic locking untuk mencegah persetujuan ganda secara bersamaan
            $booking = Booking::lockForUpdate()->findOrFail($id);

            if (in_array($booking->status, ['selesai', 'dibatalkan'])) {
                throw new HttpException(422, "Peminjaman dengan status {$booking->status} tidak dapat diproses lagi.");
            }

            $targetStatus = $data['status'];

            // Jika disetujui, pastikan kembali tidak ada konflik jadwal yang mendahului dengan lock
            if ($targetStatus === 'disetujui') {
                $conflict = Booking::where('facility_id', $booking->facility_id)
                    ->where('id', '!=', $booking->id)
                    ->where('status', 'disetujui')
                    ->where('start_at', '<', $booking->end_at)
                    ->where('end_at', '>', $booking->start_at)
                    ->lockForUpdate()
                    ->exists();

                if ($conflict) {
                    throw new HttpException(422, 'Tidak dapat menyetujui peminjaman karena fasilitas telah dibooking jadwal lain pada jam tersebut.');
                }
            }

            $oldStatus = $booking->status;
            $booking->status = $targetStatus;
            $booking->decided_by = $user->id;
            $booking->decision_notes = $data['decision_notes'] ?? null;
            $booking->save();

            return $booking;
        });

        $this->logAudit(
            $user->id,
            'booking.decide',
            'bookings',
            $booking->id,
            ['status' => $oldStatus],
            ['status' => $booking->status, 'decision_notes' => $booking->decision_notes, 'decided_by' => $user->id],
            $request
        );

        return $booking->fresh(['facility.room', 'requester', 'decider', 'items.facility']);
    }

    /**
     * BE-SAR-01: Batalkan peminjaman oleh pemohon atau staf sarpras.
     */
    public function cancelBooking(string $id, Request $request): Booking
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $booking = Booking::findOrFail($id);

        $isOwner = $booking->requested_by === $user->id;
        $isManager = $this->isManager($user);

        if (! $isOwner && ! $isManager) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak berwenang membatalkan peminjaman ini.');
        }

        if (in_array($booking->status, ['selesai', 'dibatalkan'])) {
            throw new HttpException(422, "Peminjaman dengan status {$booking->status} tidak dapat dibatalkan.");
        }

        $oldStatus = $booking->status;
        $booking->status = 'dibatalkan';
        $booking->save();

        $this->logAudit(
            $user->id,
            'booking.cancel',
            'bookings',
            $booking->id,
            ['status' => $oldStatus],
            ['status' => 'dibatalkan'],
            $request
        );

        return $booking->fresh(['facility.room', 'requester', 'decider', 'items.facility']);
    }

    protected function isManager(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('admin') ||
            $user->hasRole('super_admin') ||
            $user->hasRole('facility_staff') ||
            $user->hasRole('sarpras') ||
            $user->hasPermission('facility.booking.manage') ||
            $user->hasPermission('facility.asset.manage');
    }

    protected function authorizeManage(?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        if (! $this->isManager($user)) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang mengelola persetujuan booking fasilitas.');
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
            // Audit log must not fail transaction
        }
    }
}
