<?php

namespace App\Services\Sar;

use App\Models\AuditLog;
use App\Models\Facility;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class FacilityService
{
    /**
     * BE-SAR-01: Ambil daftar fasilitas dan ruangan.
     */
    public function listFacilities(array $filters): LengthAwarePaginator
    {
        $query = Facility::with('room')->orderBy('name', 'asc');

        if (! empty($filters['facility_type'])) {
            $query->where('facility_type', $filters['facility_type']);
        }

        if (! empty($filters['search'])) {
            $kw = '%'.strtolower($filters['search']).'%';
            $query->whereRaw('LOWER(name) LIKE ?', [$kw]);
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * BE-SAR-01: Ambil detail fasilitas berdasarkan ID.
     */
    public function getFacility(string $id): Facility
    {
        return Facility::with(['room', 'bookings' => fn ($bq) => $bq->where('end_at', '>=', now())])->findOrFail($id);
    }

    /**
     * BE-SAR-01: Buat fasilitas baru.
     */
    public function createFacility(array $data, Request $request): Facility
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $facility = Facility::create([
            'school_id' => $data['school_id'] ?? null,
            'room_id' => $data['room_id'] ?? null,
            'name' => $data['name'],
            'facility_type' => $data['facility_type'] ?? 'ruang',
            'capacity' => $data['capacity'] ?? null,
            'requires_approval' => $data['requires_approval'] ?? true,
        ]);

        $this->logAudit($user?->id, 'facility.create', 'facilities', $facility->id, null, $facility->toArray(), $request);

        return $facility->fresh('room');
    }

    /**
     * BE-SAR-01: Perbarui fasilitas.
     */
    public function updateFacility(string $id, array $data, Request $request): Facility
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $facility = Facility::findOrFail($id);
        $oldValues = $facility->toArray();

        $facility->update($data);

        $this->logAudit($user?->id, 'facility.update', 'facilities', $facility->id, $oldValues, $facility->fresh()->toArray(), $request);

        return $facility->fresh('room');
    }

    /**
     * BE-SAR-01: Hapus fasilitas jika belum ada riwayat booking aktif.
     */
    public function deleteFacility(string $id, Request $request): bool
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $facility = Facility::findOrFail($id);

        $hasActiveBookings = $facility->bookings()
            ->whereIn('status', ['diajukan', 'disetujui'])
            ->exists();

        if ($hasActiveBookings) {
            throw new HttpException(422, 'Fasilitas tidak dapat dihapus karena memiliki peminjaman aktif.');
        }

        $oldValues = $facility->toArray();
        $facility->delete();

        $this->logAudit($user?->id, 'facility.delete', 'facilities', $id, $oldValues, null, $request);

        return true;
    }

    protected function authorizeManage($user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $canManage = $user->hasRole('admin') ||
            $user->hasRole('super_admin') ||
            $user->hasRole('facility_staff') ||
            $user->hasRole('sarpras') ||
            $user->hasPermission('facility.booking.manage') ||
            $user->hasPermission('facility.asset.manage');

        if (! $canManage) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang mengelola data fasilitas.');
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
