<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\ClassStudent;
use App\Models\Grade;
use App\Models\GradeComponent;
use App\Models\GradePeriod;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GradeService
{
    // =========================================================================
    // 1. Grade Components (Komponen Nilai)
    // =========================================================================

    /**
     * BE-GRD-01: Daftar komponen nilai per mapel & semester.
     */
    public function listComponents(array $filters): Collection
    {
        $query = GradeComponent::with(['subject', 'semester', 'class'])
            ->orderBy('created_at', 'asc');

        if (! empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (! empty($filters['semester_id'])) {
            $query->where('semester_id', $filters['semester_id']);
        }

        if (array_key_exists('class_id', $filters)) {
            if ($filters['class_id'] === null) {
                $query->whereNull('class_id');
            } else {
                $query->where('class_id', $filters['class_id']);
            }
        }

        return $query->get();
    }

    /**
     * BE-GRD-01: Tambah komponen nilai baru.
     */
    public function createComponent(array $data, Request $request): GradeComponent
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        return DB::transaction(function () use ($data, $currentUser, $request) {
            $component = GradeComponent::create([
                'subject_id' => $data['subject_id'],
                'semester_id' => $data['semester_id'],
                'class_id' => $data['class_id'] ?? null,
                'code' => strtoupper(trim($data['code'])),
                'name' => trim($data['name']),
                'weight' => $data['weight'],
            ]);

            $this->logAudit(
                $currentUser->id,
                'grade_component.created',
                'GradeComponent',
                $component->id,
                null,
                $component->toArray(),
                $request
            );

            return $component->load(['subject', 'semester', 'class']);
        });
    }

    /**
     * BE-GRD-01: Update komponen nilai.
     */
    public function updateComponent(string $id, array $data, Request $request): GradeComponent
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $component = GradeComponent::findOrFail($id);

        return DB::transaction(function () use ($component, $data, $currentUser, $request) {
            $oldData = $component->toArray();

            if (isset($data['code'])) {
                $component->code = strtoupper(trim($data['code']));
            }
            if (isset($data['name'])) {
                $component->name = trim($data['name']);
            }
            if (isset($data['weight'])) {
                $component->weight = $data['weight'];
            }
            $component->save();

            $this->logAudit(
                $currentUser->id,
                'grade_component.updated',
                'GradeComponent',
                $component->id,
                $oldData,
                $component->toArray(),
                $request
            );

            return $component->load(['subject', 'semester', 'class']);
        });
    }

    /**
     * BE-GRD-01: Hapus komponen nilai.
     */
    public function deleteComponent(string $id, Request $request): bool
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $component = GradeComponent::findOrFail($id);

        if ($component->grades()->exists()) {
            throw new HttpException(422, 'Komponen nilai tidak dapat dihapus karena sudah memiliki data nilai siswa.');
        }

        return DB::transaction(function () use ($component, $currentUser, $request) {
            $oldData = $component->toArray();
            $component->delete();

            $this->logAudit(
                $currentUser->id,
                'grade_component.deleted',
                'GradeComponent',
                $component->id,
                $oldData,
                null,
                $request
            );

            return true;
        });
    }

    // =========================================================================
    // 2. Grades (Buku Nilai & Input Massal)
    // =========================================================================

    /**
     * BE-GRD-01: Ambil daftar nilai dengan filter dan otorisasi IDOR.
     */
    public function listGrades(array $filters, Request $request): LengthAwarePaginator
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $student = Student::where('user_id', $currentUser->id)->first();
        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        $isAdmin = $this->checkIsAdmin($currentUser);

        $query = Grade::with(['student', 'component.subject', 'period', 'enterer'])
            ->orderBy('created_at', 'desc');

        if (! $isAdmin) {
            if ($student) {
                // Siswa hanya melihat miliknya sendiri
                $query->where('student_id', $student->id);
            } elseif ($guardian) {
                // Wali murid melihat milik anak-anaknya
                $childIds = $guardian->students()->pluck('students.id');
                $query->whereIn('student_id', $childIds);
            }
        }

        if (! empty($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        if (! empty($filters['component_id'])) {
            $query->where('component_id', $filters['component_id']);
        }

        if (! empty($filters['period_id'])) {
            $query->where('period_id', $filters['period_id']);
        }

        if (! empty($filters['class_id'])) {
            $classId = $filters['class_id'];
            $studentIds = ClassStudent::where('class_id', $classId)->pluck('student_id');
            $query->whereIn('student_id', $studentIds);
        }

        if (! empty($filters['subject_id'])) {
            $subjectId = $filters['subject_id'];
            $query->whereHas('component', fn ($q) => $q->where('subject_id', $subjectId));
        }

        $perPage = (int) ($filters['per_page'] ?? 30);

        return $query->paginate($perPage);
    }

    /**
     * BE-GRD-01: Input / update nilai satuan.
     */
    public function storeGrade(array $data, Request $request): Grade
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $this->authorizeGradeEntry($currentUser, $data['component_id']);

        $period = GradePeriod::findOrFail($data['period_id']);
        if ($period->status === 'locked') {
            throw new HttpException(422, 'Periode penilaian telah dikunci. Perubahan nilai tidak diizinkan tanpa persetujuan / pembukaan kunci.');
        }

        return DB::transaction(function () use ($data, $currentUser, $request) {
            $grade = Grade::updateOrCreate(
                [
                    'student_id' => $data['student_id'],
                    'component_id' => $data['component_id'],
                    'period_id' => $data['period_id'],
                ],
                [
                    'value' => $data['value'],
                    'source' => $data['source'] ?? 'manual',
                    'entered_by' => $currentUser->id,
                ]
            );

            $this->logAudit(
                $currentUser->id,
                'grade.entered',
                'Grade',
                $grade->id,
                null,
                $grade->toArray(),
                $request
            );

            return $grade->load(['student', 'component', 'period']);
        });
    }

    /**
     * BE-GRD-01: Input massal nilai satu kelas / komponen.
     */
    public function bulkStoreGrades(array $data, Request $request): array
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $this->authorizeGradeEntry($currentUser, $data['component_id']);

        $period = GradePeriod::findOrFail($data['period_id']);
        if ($period->status === 'locked') {
            throw new HttpException(422, 'Periode penilaian telah dikunci. Perubahan nilai massal tidak diizinkan tanpa pembukaan kunci.');
        }

        return DB::transaction(function () use ($data, $currentUser, $request) {
            $savedGrades = [];

            foreach ($data['grades'] as $item) {
                $grade = Grade::updateOrCreate(
                    [
                        'student_id' => $item['student_id'],
                        'component_id' => $data['component_id'],
                        'period_id' => $data['period_id'],
                    ],
                    [
                        'value' => $item['value'],
                        'source' => 'manual',
                        'entered_by' => $currentUser->id,
                    ]
                );

                $savedGrades[] = $grade;
            }

            $this->logAudit(
                $currentUser->id,
                'grade.bulk_entered',
                'Grade',
                $data['component_id'],
                null,
                ['count' => count($savedGrades)],
                $request
            );

            return [
                'count' => count($savedGrades),
                'component_id' => $data['component_id'],
                'period_id' => $data['period_id'],
                'items' => $savedGrades,
            ];
        });
    }

    // =========================================================================
    // 3. Grade Period Lock (Kunci Periode Penilaian)
    // =========================================================================

    /**
     * BE-GRD-01: Kunci / buka kunci periode penilaian bulanan.
     */
    public function togglePeriodLock(string $periodId, array $data, Request $request): GradePeriod
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $isAdmin = $this->checkIsAdmin($currentUser);

        if (! $isAdmin) {
            throw new HttpException(403, 'Hanya administrator atau waka kurikulum yang berhak mengunci/membuka periode penilaian.');
        }

        $period = GradePeriod::findOrFail($periodId);

        return DB::transaction(function () use ($period, $data, $currentUser, $request) {
            $oldData = $period->toArray();

            if ($data['status'] === 'locked') {
                $period->update([
                    'status' => 'locked',
                    'locked_by' => $currentUser->id,
                    'locked_at' => Carbon::now(),
                ]);
            } else {
                $period->update([
                    'status' => 'open',
                    'locked_by' => null,
                    'locked_at' => null,
                ]);
            }

            $this->logAudit(
                $currentUser->id,
                'grade_period.lock_updated',
                'GradePeriod',
                $period->id,
                $oldData,
                $period->toArray(),
                $request
            );

            return $period->load(['semester', 'locker']);
        });
    }

    /**
     * Validasi otorisasi apakah pengguna berhak menginput nilai komponen ini.
     */
    protected function authorizeGradeEntry(User $user, string $componentId): void
    {
        if ($this->checkIsAdmin($user)) {
            return;
        }

        $teacher = Teacher::where('user_id', $user->id)->first();
        if (! $teacher) {
            throw new HttpException(403, 'Hanya guru atau administrator yang berhak menginput nilai.');
        }

        $component = GradeComponent::findOrFail($componentId);

        // Jika komponen terikat pada kelas tertentu, guru harus mengampu kelas atau menjadi walas
        if ($component->class_id) {
            $isAssigned = $teacher->teachingAssignments()
                ->where('class_id', $component->class_id)
                ->where('subject_id', $component->subject_id)
                ->exists();

            $isHomeroom = $component->class && $component->class->homeroom_teacher_id === $teacher->id;

            if (! $isAssigned && ! $isHomeroom) {
                throw new HttpException(403, 'Anda tidak ditugaskan untuk mengajar mata pelajaran ini pada kelas tersebut.');
            }
        }
    }

    /**
     * Cek apakah pengguna adalah admin kurikulum, TU, atau super admin.
     */
    protected function checkIsAdmin(User $user): bool
    {
        return $user->hasRole('super_admin')
            || $user->hasRole('admin_tu')
            || $user->hasRole('admin_kurikulum')
            || $user->hasRole('principal')
            || $user->hasPermission('academic.schedule.manage')
            || $user->roles()->where('code', 'like', 'admin%')->exists();
    }

    /**
     * Catat log audit keamanan.
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
