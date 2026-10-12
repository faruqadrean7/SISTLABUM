<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Staff;
use App\Models\Teacher;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TeacherStaffService
{
    /**
     * BE-MST-03: List teachers with pagination, search, and relations.
     */
    public function listTeachers(Request $request): LengthAwarePaginator
    {
        $limit = min($request->integer('limit', 20), 100);
        $status = $request->query('status');
        $q = trim((string) $request->query('q', ''));

        $query = Teacher::with([
            'teachingAssignments.subject',
            'homeroomClasses',
            'photoFile',
        ]);

        if ($status) {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('full_name', 'like', "%{$q}%")
                    ->orWhere('nip', 'like', "%{$q}%")
                    ->orWhere('nuptk', 'like', "%{$q}%")
                    ->orWhere('position', 'like', "%{$q}%");
            });
        }

        return $query->orderBy('full_name', 'asc')->paginate($limit);
    }

    /**
     * BE-MST-03: Get detail of a teacher.
     */
    public function getTeacher(string $id): Teacher
    {
        return Teacher::with([
            'teachingAssignments.subject',
            'teachingAssignments.class',
            'homeroomClasses',
            'photoFile',
            'user',
        ])->findOrFail($id);
    }

    /**
     * BE-MST-03: Create new teacher.
     */
    public function createTeacher(array $data, Request $request): Teacher
    {
        return DB::transaction(function () use ($data, $request) {
            $teacher = Teacher::create([
                'school_id' => $data['school_id'] ?? $request->user()?->school_id,
                'user_id' => $data['user_id'] ?? null,
                'nip' => $data['nip'] ?? null,
                'nuptk' => $data['nuptk'] ?? null,
                'full_name' => $data['full_name'],
                'position' => $data['position'] ?? null,
                'status' => $data['status'] ?? 'tetap',
                'photo_file_id' => $data['photo_file_id'] ?? null,
            ]);

            $this->logAudit(
                $request->user()?->id,
                'teacher.created',
                'Teacher',
                $teacher->id,
                null,
                $teacher->toArray(),
                $request
            );

            return $teacher;
        });
    }

    /**
     * BE-MST-03: Update teacher.
     */
    public function updateTeacher(string $id, array $data, Request $request): Teacher
    {
        return DB::transaction(function () use ($id, $data, $request) {
            $teacher = Teacher::findOrFail($id);
            $oldValue = $teacher->toArray();

            $fields = ['nip', 'nuptk', 'full_name', 'position', 'status', 'photo_file_id', 'user_id'];
            foreach ($fields as $field) {
                if (array_key_exists($field, $data)) {
                    $teacher->{$field} = $data[$field];
                }
            }

            $teacher->save();

            $this->logAudit(
                $request->user()?->id,
                'teacher.updated',
                'Teacher',
                $teacher->id,
                $oldValue,
                $teacher->toArray(),
                $request
            );

            return $teacher;
        });
    }

    /**
     * BE-MST-03: Delete teacher.
     */
    public function deleteTeacher(string $id, Request $request): void
    {
        $teacher = Teacher::findOrFail($id);

        if ($teacher->teachingAssignments()->exists()) {
            throw new HttpException(
                409,
                'Guru tidak dapat dihapus karena masih memiliki penugasan mengajar aktif.',
                null,
                [],
                409
            );
        }

        $oldValue = $teacher->toArray();
        $teacher->delete();

        $this->logAudit(
            $request->user()?->id,
            'teacher.deleted',
            'Teacher',
            $teacher->id,
            $oldValue,
            null,
            $request
        );
    }

    /**
     * BE-MST-03: Import teachers from CSV with row-by-row validation.
     */
    public function importTeachers(UploadedFile $file, Request $request): array
    {
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        if (! $handle) {
            throw new HttpException(400, 'Berkas tidak dapat dibaca.', null, [], 400);
        }

        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, ';') ? ';' : ',';
        rewind($handle);

        $header = fgetcsv($handle, 0, $delimiter);
        if (! $header) {
            fclose($handle);
            throw new HttpException(400, 'Berkas CSV kosong atau tidak memiliki baris header.', null, [], 400);
        }

        $headerMap = [];
        foreach ($header as $idx => $col) {
            $headerMap[strtolower(trim($col, " \t\n\r\0\x0B\"'"))] = $idx;
        }

        if (! isset($headerMap['full_name'])) {
            fclose($handle);
            throw new HttpException(400, "Format kolom CSV tidak sesuai: kolom 'full_name' wajib ada di header.", null, [], 400);
        }

        $rowNumber = 1;
        $errors = [];
        $recordsToInsert = [];
        $seenNip = [];
        $seenNuptk = [];

        $existingNip = Teacher::whereNotNull('nip')->pluck('nip')->flip()->toArray();
        $existingNuptk = Teacher::whereNotNull('nuptk')->pluck('nuptk')->flip()->toArray();

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rowNumber++;

            if (count(array_filter($row)) === 0) {
                continue;
            }

            $fullName = isset($headerMap['full_name']) && isset($row[$headerMap['full_name']])
                ? trim($row[$headerMap['full_name']])
                : '';
            $nip = isset($headerMap['nip']) && isset($row[$headerMap['nip']]) && trim($row[$headerMap['nip']]) !== ''
                ? trim($row[$headerMap['nip']])
                : null;
            $nuptk = isset($headerMap['nuptk']) && isset($row[$headerMap['nuptk']]) && trim($row[$headerMap['nuptk']]) !== ''
                ? trim($row[$headerMap['nuptk']])
                : null;
            $position = isset($headerMap['position']) && isset($row[$headerMap['position']])
                ? trim($row[$headerMap['position']])
                : null;
            $status = isset($headerMap['status']) && isset($row[$headerMap['status']]) && trim($row[$headerMap['status']]) !== ''
                ? strtolower(trim($row[$headerMap['status']]))
                : 'tetap';

            $rowErrors = [];

            if (empty($fullName)) {
                $rowErrors[] = 'Nama lengkap guru wajib diisi';
            }

            if ($nip !== null) {
                if (isset($existingNip[$nip]) || isset($seenNip[$nip])) {
                    $rowErrors[] = "NIP '{$nip}' sudah terdaftar";
                } else {
                    $seenNip[$nip] = true;
                }
            }

            if ($nuptk !== null) {
                if (isset($existingNuptk[$nuptk]) || isset($seenNuptk[$nuptk])) {
                    $rowErrors[] = "NUPTK '{$nuptk}' sudah terdaftar";
                } else {
                    $seenNuptk[$nuptk] = true;
                }
            }

            if (! in_array($status, ['tetap', 'honorer', 'kontrak'], true)) {
                $rowErrors[] = "Status harus salah satu dari: tetap, honorer, kontrak (diterima: '{$status}')";
            }

            if (! empty($rowErrors)) {
                $errors[] = [
                    'row' => $rowNumber,
                    'messages' => $rowErrors,
                ];
            } else {
                $recordsToInsert[] = [
                    'nip' => $nip,
                    'nuptk' => $nuptk,
                    'full_name' => $fullName,
                    'position' => $position,
                    'status' => $status,
                ];
            }
        }

        fclose($handle);

        if (! empty($errors)) {
            return [
                'success' => false,
                'total' => count($recordsToInsert) + count($errors),
                'imported' => 0,
                'failed' => count($errors),
                'errors' => $errors,
            ];
        }

        DB::transaction(function () use ($recordsToInsert, $request) {
            foreach ($recordsToInsert as $item) {
                Teacher::create([
                    'school_id' => $request->user()?->school_id,
                    'nip' => $item['nip'],
                    'nuptk' => $item['nuptk'],
                    'full_name' => $item['full_name'],
                    'position' => $item['position'],
                    'status' => $item['status'],
                ]);
            }

            $this->logAudit(
                $request->user()?->id,
                'teacher.imported',
                'Teacher',
                null,
                null,
                ['count' => count($recordsToInsert)],
                $request
            );
        });

        return [
            'success' => true,
            'total' => count($recordsToInsert),
            'imported' => count($recordsToInsert),
            'failed' => 0,
            'errors' => [],
        ];
    }

    // =========================================================================
    // STAF METHODS
    // =========================================================================

    /**
     * BE-MST-03: List staff with pagination and search.
     */
    public function listStaff(Request $request): LengthAwarePaginator
    {
        $limit = min($request->integer('limit', 20), 100);
        $unit = $request->query('unit');
        $q = trim((string) $request->query('q', ''));

        $query = Staff::with('user');

        if ($unit) {
            $query->where('unit', $unit);
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('full_name', 'like', "%{$q}%")
                    ->orWhere('position', 'like', "%{$q}%")
                    ->orWhere('unit', 'like', "%{$q}%");
            });
        }

        return $query->orderBy('full_name', 'asc')->paginate($limit);
    }

    /**
     * BE-MST-03: Get detail of staff.
     */
    public function getStaff(string $id): Staff
    {
        return Staff::with('user')->findOrFail($id);
    }

    /**
     * BE-MST-03: Create new staff.
     */
    public function createStaff(array $data, Request $request): Staff
    {
        return DB::transaction(function () use ($data, $request) {
            $staff = Staff::create([
                'school_id' => $data['school_id'] ?? $request->user()?->school_id,
                'user_id' => $data['user_id'] ?? null,
                'full_name' => $data['full_name'],
                'position' => $data['position'] ?? null,
                'unit' => $data['unit'] ?? null,
            ]);

            $this->logAudit(
                $request->user()?->id,
                'staff.created',
                'Staff',
                $staff->id,
                null,
                $staff->toArray(),
                $request
            );

            return $staff;
        });
    }

    /**
     * BE-MST-03: Update staff.
     */
    public function updateStaff(string $id, array $data, Request $request): Staff
    {
        return DB::transaction(function () use ($id, $data, $request) {
            $staff = Staff::findOrFail($id);
            $oldValue = $staff->toArray();

            $fields = ['full_name', 'position', 'unit', 'user_id'];
            foreach ($fields as $field) {
                if (array_key_exists($field, $data)) {
                    $staff->{$field} = $data[$field];
                }
            }

            $staff->save();

            $this->logAudit(
                $request->user()?->id,
                'staff.updated',
                'Staff',
                $staff->id,
                $oldValue,
                $staff->toArray(),
                $request
            );

            return $staff;
        });
    }

    /**
     * BE-MST-03: Delete staff.
     */
    public function deleteStaff(string $id, Request $request): void
    {
        $staff = Staff::findOrFail($id);
        $oldValue = $staff->toArray();

        $staff->delete();

        $this->logAudit(
            $request->user()?->id,
            'staff.deleted',
            'Staff',
            $staff->id,
            $oldValue,
            null,
            $request
        );
    }

    /**
     * BE-MST-03: Import staff from CSV with row-by-row validation.
     */
    public function importStaff(UploadedFile $file, Request $request): array
    {
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        if (! $handle) {
            throw new HttpException(400, 'Berkas tidak dapat dibaca.', null, [], 400);
        }

        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, ';') ? ';' : ',';
        rewind($handle);

        $header = fgetcsv($handle, 0, $delimiter);
        if (! $header) {
            fclose($handle);
            throw new HttpException(400, 'Berkas CSV kosong atau tidak memiliki baris header.', null, [], 400);
        }

        $headerMap = [];
        foreach ($header as $idx => $col) {
            $headerMap[strtolower(trim($col, " \t\n\r\0\x0B\"'"))] = $idx;
        }

        if (! isset($headerMap['full_name'])) {
            fclose($handle);
            throw new HttpException(400, "Format kolom CSV tidak sesuai: kolom 'full_name' wajib ada di header.", null, [], 400);
        }

        $rowNumber = 1;
        $errors = [];
        $recordsToInsert = [];

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rowNumber++;

            if (count(array_filter($row)) === 0) {
                continue;
            }

            $fullName = isset($headerMap['full_name']) && isset($row[$headerMap['full_name']])
                ? trim($row[$headerMap['full_name']])
                : '';
            $position = isset($headerMap['position']) && isset($row[$headerMap['position']])
                ? trim($row[$headerMap['position']])
                : null;
            $unit = isset($headerMap['unit']) && isset($row[$headerMap['unit']])
                ? trim($row[$headerMap['unit']])
                : null;

            if (empty($fullName)) {
                $errors[] = [
                    'row' => $rowNumber,
                    'messages' => ['Nama lengkap staf wajib diisi'],
                ];
            } else {
                $recordsToInsert[] = [
                    'full_name' => $fullName,
                    'position' => $position,
                    'unit' => $unit,
                ];
            }
        }

        fclose($handle);

        if (! empty($errors)) {
            return [
                'success' => false,
                'total' => count($recordsToInsert) + count($errors),
                'imported' => 0,
                'failed' => count($errors),
                'errors' => $errors,
            ];
        }

        DB::transaction(function () use ($recordsToInsert, $request) {
            foreach ($recordsToInsert as $item) {
                Staff::create([
                    'school_id' => $request->user()?->school_id,
                    'full_name' => $item['full_name'],
                    'position' => $item['position'],
                    'unit' => $item['unit'],
                ]);
            }

            $this->logAudit(
                $request->user()?->id,
                'staff.imported',
                'Staff',
                null,
                null,
                ['count' => count($recordsToInsert)],
                $request
            );
        });

        return [
            'success' => true,
            'total' => count($recordsToInsert),
            'imported' => count($recordsToInsert),
            'failed' => 0,
            'errors' => [],
        ];
    }

    /**
     * Helper to write an audit log entry.
     */
    protected function logAudit(
        ?string $actorId,
        string $action,
        string $entity,
        ?string $entityId,
        ?array $oldValue,
        ?array $newValue,
        Request $request
    ): void {
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
            report($e);
        }
    }
}
