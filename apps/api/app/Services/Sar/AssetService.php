<?php

namespace App\Services\Sar;

use App\Models\Asset;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AssetService
{
    /**
     * BE-SAR-02: Daftar aset berpaginasi.
     */
    public function listAssets(array $filters): LengthAwarePaginator
    {
        $query = Asset::with('room')->orderBy('created_at', 'desc');

        if (! empty($filters['room_id'])) {
            $query->where('room_id', $filters['room_id']);
        }

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['asset_condition'])) {
            $query->where('asset_condition', $filters['asset_condition']);
        }

        if (! empty($filters['search'])) {
            $kw = '%'.strtolower($filters['search']).'%';
            $query->where(function ($q) use ($kw) {
                $q->whereRaw('LOWER(name) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(asset_code) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(brand) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(model) LIKE ?', [$kw]);
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * BE-SAR-02: Detail aset berdasarkan ID.
     */
    public function getAsset(string $id): Asset
    {
        return Asset::with(['room', 'auditItems.audit'])->findOrFail($id);
    }

    /**
     * BE-SAR-02: Scan / lookup aset berdasarkan kode QR/barcode.
     */
    public function getAssetByCode(string $code): Asset
    {
        return Asset::with(['room', 'auditItems.audit'])
            ->where('asset_code', $code)
            ->firstOrFail();
    }

    /**
     * BE-SAR-02: Registrasi aset baru.
     */
    public function createAsset(array $data, Request $request): Asset
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $asset = Asset::create([
            'school_id' => $data['school_id'] ?? null,
            'room_id' => $data['room_id'] ?? null,
            'asset_code' => $data['asset_code'],
            'name' => $data['name'],
            'category' => $data['category'],
            'brand' => $data['brand'] ?? null,
            'model' => $data['model'] ?? null,
            'serial_number' => $data['serial_number'] ?? null,
            'asset_condition' => $data['asset_condition'] ?? 'baik',
            'acquired_at' => $data['acquired_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        $this->logAudit($user?->id, 'asset.create', 'assets', $asset->id, null, $asset->toArray(), $request);

        return $asset->fresh('room');
    }

    /**
     * BE-SAR-02: Perbarui data aset.
     */
    public function updateAsset(string $id, array $data, Request $request): Asset
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $asset = Asset::findOrFail($id);
        $oldValues = $asset->toArray();

        $asset->update($data);

        $this->logAudit($user?->id, 'asset.update', 'assets', $asset->id, $oldValues, $asset->fresh()->toArray(), $request);

        return $asset->fresh('room');
    }

    /**
     * BE-SAR-02: Hapus data aset.
     */
    public function deleteAsset(string $id, Request $request): bool
    {
        $user = $request->user();
        $this->authorizeManage($user);

        $asset = Asset::findOrFail($id);
        $oldValues = $asset->toArray();

        $asset->delete();

        $this->logAudit($user?->id, 'asset.delete', 'assets', $id, $oldValues, null, $request);

        return true;
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
            $user->hasPermission('facility.asset.manage') ||
            $user->hasPermission('facility.booking.manage');

        if (! $canManage) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang mengelola data aset.');
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
