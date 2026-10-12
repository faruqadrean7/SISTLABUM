<?php

namespace App\Services\Sar;

use App\Models\AuditLog;
use App\Models\LabEquipment;
use App\Models\LabLoan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class LabService
{
    /**
     * BE-SAR-04: Daftar alat laboratorium berpaginasi.
     */
    public function listEquipment(array $filters): LengthAwarePaginator
    {
        $query = LabEquipment::with('room')->orderBy('created_at', 'desc');

        if (! empty($filters['room_id'])) {
            $query->where('room_id', $filters['room_id']);
        }

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['condition'])) {
            $query->where('condition', $filters['condition']);
        }

        if (! empty($filters['search'])) {
            $kw = '%'.strtolower($filters['search']).'%';
            $query->where(function ($q) use ($kw) {
                $q->whereRaw('LOWER(name) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(code) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(category) LIKE ?', [$kw]);
            });
        }

        $paginator = $query->paginate((int) ($filters['per_page'] ?? 15));

        $paginator->getCollection()->transform(function (LabEquipment $item) {
            $item->append('available_stock');

            return $item;
        });

        return $paginator;
    }

    /**
     * BE-SAR-04: Detail inventaris alat laboratorium.
     */
    public function getEquipment(string $id): LabEquipment
    {
        $equipment = LabEquipment::with(['room', 'loans.borrower'])->findOrFail($id);
        $equipment->append('available_stock');

        return $equipment;
    }

    /**
     * BE-SAR-04: Tambah alat laboratorium baru.
     */
    public function createEquipment(array $data, Request $request): LabEquipment
    {
        $user = $request->user();
        $this->authorizeManageLab($user);

        $equipment = LabEquipment::create([
            'school_id' => $data['school_id'] ?? null,
            'room_id' => $data['room_id'],
            'code' => $data['code'] ?? null,
            'name' => $data['name'],
            'category' => $data['category'] ?? null,
            'stock' => $data['stock'] ?? 1,
            'condition' => $data['condition'] ?? 'baik',
            'notes' => $data['notes'] ?? null,
        ]);

        $this->logAudit($user?->id, 'lab_equipment.create', 'lab_equipment', $equipment->id, null, $equipment->toArray(), $request);

        $equipment->append('available_stock');

        return $equipment->fresh('room');
    }

    /**
     * BE-SAR-04: Perbarui data alat laboratorium.
     */
    public function updateEquipment(string $id, array $data, Request $request): LabEquipment
    {
        $user = $request->user();
        $this->authorizeManageLab($user);

        $equipment = LabEquipment::findOrFail($id);
        $oldValues = $equipment->toArray();

        $equipment->update($data);

        $this->logAudit($user?->id, 'lab_equipment.update', 'lab_equipment', $equipment->id, $oldValues, $equipment->fresh()->toArray(), $request);

        $equipment->append('available_stock');

        return $equipment->fresh('room');
    }

    /**
     * BE-SAR-04: Hapus alat laboratorium.
     */
    public function deleteEquipment(string $id, Request $request): bool
    {
        $user = $request->user();
        $this->authorizeManageLab($user);

        $equipment = LabEquipment::findOrFail($id);

        if ($equipment->active_loans_quantity > 0) {
            throw new HttpException(422, 'Alat lab tidak dapat dihapus karena masih ada peminjaman aktif.');
        }

        $oldValues = $equipment->toArray();
        $equipment->delete();

        $this->logAudit($user?->id, 'lab_equipment.delete', 'lab_equipment', $id, $oldValues, null, $request);

        return true;
    }

    /**
     * BE-SAR-04: Daftar transaksi peminjaman alat lab.
     */
    public function listLoans(array $filters, Request $request): LengthAwarePaginator
    {
        $user = $request->user();
        $isStaff = $this->isLabStaffOrAdmin($user);

        $query = LabLoan::with(['equipment.room', 'borrower'])->orderBy('created_at', 'desc');

        if (! $isStaff) {
            $query->where('borrower_id', $user->id);
        } elseif (! empty($filters['borrower_id'])) {
            $query->where('borrower_id', $filters['borrower_id']);
        }

        if (! empty($filters['equipment_id'])) {
            $query->where('equipment_id', $filters['equipment_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * BE-SAR-04: Detail peminjaman alat lab.
     */
    public function getLoan(string $id, Request $request): LabLoan
    {
        $user = $request->user();
        $loan = LabLoan::with(['equipment.room', 'borrower'])->findOrFail($id);

        if (! $this->isLabStaffOrAdmin($user) && $loan->borrower_id !== $user->id) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki akses ke peminjaman alat lab ini.');
        }

        return $loan;
    }

    /**
     * BE-SAR-04: Peminjaman alat lab untuk praktikum / kegiatan.
     */
    public function createLoan(array $data, Request $request): LabLoan
    {
        $user = $request->user();
        $borrowerId = $data['borrower_id'] ?? $user->id;

        if ($borrowerId !== $user->id && ! $this->isLabStaffOrAdmin($user)) {
            throw new HttpException(403, 'Akses ditolak: Anda hanya dapat meminjam alat lab untuk diri sendiri.');
        }

        $equipment = LabEquipment::findOrFail($data['equipment_id']);
        $quantity = (int) ($data['quantity'] ?? 1);

        if ($equipment->available_stock < $quantity) {
            throw new HttpException(422, 'Stok alat laboratorium tidak mencukupi untuk dipinjam.');
        }

        $loanDate = $data['loan_date'] ?? Carbon::now()->toDateString();
        $dueDate = $data['due_date'];

        $loan = LabLoan::create([
            'equipment_id' => $equipment->id,
            'borrower_id' => $borrowerId,
            'loan_date' => $loanDate,
            'due_date' => $dueDate,
            'quantity' => $quantity,
            'status' => 'dipinjam',
            'purpose' => $data['purpose'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        $this->logAudit($user?->id, 'lab_loan.create', 'lab_loans', $loan->id, null, $loan->toArray(), $request);

        return $loan->fresh(['equipment.room', 'borrower']);
    }

    /**
     * BE-SAR-04: Pengembalian alat laboratorium.
     */
    public function returnLoan(string $id, array $data, Request $request): LabLoan
    {
        $user = $request->user();
        $loan = LabLoan::with(['equipment', 'borrower'])->findOrFail($id);

        if (! $this->isLabStaffOrAdmin($user) && $loan->borrower_id !== $user->id) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak berwenang mengembalikan pinjaman alat lab ini.');
        }

        if ($loan->status === 'dikembalikan') {
            throw new HttpException(422, 'Peminjaman alat laboratorium ini sudah dikembalikan.');
        }

        $oldValues = $loan->toArray();
        $returnedAt = $data['returned_at'] ?? Carbon::now()->toDateString();

        $loan->update([
            'returned_at' => $returnedAt,
            'status' => 'dikembalikan',
            'notes' => $data['notes'] ?? $loan->notes,
        ]);

        $this->logAudit($user?->id, 'lab_loan.return', 'lab_loans', $loan->id, $oldValues, $loan->fresh()->toArray(), $request);

        return $loan->fresh(['equipment.room', 'borrower']);
    }

    public function isLabStaffOrAdmin(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('admin') ||
            $user->hasRole('super_admin') ||
            $user->hasRole('laboran') ||
            $user->hasRole('lab_assistant') ||
            $user->hasRole('facility_staff') ||
            $user->hasRole('sarpras') ||
            $user->hasPermission('lab.equipment.manage') ||
            $user->hasPermission('lab.loan.manage') ||
            $user->hasPermission('facility.asset.manage');
    }

    protected function authorizeManageLab(?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        if (! $this->isLabStaffOrAdmin($user)) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang mengelola alat laboratorium.');
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
            // Audit log failure must not fail transaction
        }
    }
}
