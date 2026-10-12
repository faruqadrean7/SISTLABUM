<?php

namespace App\Services\Std;

use App\Models\Achievement;
use App\Models\AuditLog;
use App\Models\Competition;
use App\Models\CompetitionEntry;
use App\Models\PointType;
use App\Models\Student;
use App\Models\StudentPoint;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CompetitionAndAchievementService
{
    // =========================================================================
    // 1. MASTER KOMPETISI / LOMBA
    // =========================================================================

    public function listCompetitions(array $filters): LengthAwarePaginator
    {
        $query = Competition::with('entries.student')->orderBy('held_at', 'desc');

        if (! empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['search'])) {
            $kw = '%'.strtolower($filters['search']).'%';
            $query->where(function ($q) use ($kw) {
                $q->whereRaw('LOWER(name) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(organizer) LIKE ?', [$kw]);
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function getCompetition(string $id): Competition
    {
        return Competition::with([
            'entries.student',
            'entries.coach',
            'entries.achievement',
            'achievements.student',
            'achievements.photoFile',
        ])->findOrFail($id);
    }

    public function createCompetition(array $data, Request $request): Competition
    {
        $user = $request->user();
        $this->authorizeTeacherOrStaff($user);

        $competition = Competition::create([
            'school_id' => $data['school_id'] ?? null,
            'name' => $data['name'],
            'organizer' => $data['organizer'] ?? null,
            'level' => $data['level'],
            'category' => $data['category'] ?? null,
            'held_at' => $data['held_at'],
            'description' => $data['description'] ?? null,
        ]);

        $this->logAudit($user?->id, 'competition.create', 'competitions', $competition->id, null, $competition->toArray(), $request);

        return $competition;
    }

    public function updateCompetition(string $id, array $data, Request $request): Competition
    {
        $user = $request->user();
        $this->authorizeTeacherOrStaff($user);

        $competition = Competition::findOrFail($id);
        $oldValues = $competition->toArray();

        $competition->update($data);

        $this->logAudit($user?->id, 'competition.update', 'competitions', $competition->id, $oldValues, $competition->fresh()->toArray(), $request);

        return $competition->fresh();
    }

    public function deleteCompetition(string $id, Request $request): bool
    {
        $user = $request->user();
        $this->authorizeStaffOrAdmin($user);

        $competition = Competition::findOrFail($id);
        $oldValues = $competition->toArray();

        $competition->delete();

        $this->logAudit($user?->id, 'competition.delete', 'competitions', $id, $oldValues, null, $request);

        return true;
    }

    // =========================================================================
    // 2. DELEGASI PESERTA KOMPETISI (ENTRIES)
    // =========================================================================

    public function listEntries(string $competitionId): LengthAwarePaginator
    {
        return CompetitionEntry::with(['student', 'coach', 'achievement'])
            ->where('competition_id', $competitionId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    public function registerEntry(array $data, Request $request): CompetitionEntry
    {
        $user = $request->user();
        $this->authorizeTeacherOrStaff($user);

        $competition = Competition::findOrFail($data['competition_id']);
        $student = Student::findOrFail($data['student_id']);

        // Cegah pendaftaran ganda siswa yang sama pada satu kompetisi
        $existing = CompetitionEntry::where('competition_id', $competition->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existing) {
            throw new HttpException(422, 'Siswa ini sudah terdaftar sebagai delegasi pada kompetisi terkait.');
        }

        $entry = CompetitionEntry::create([
            'competition_id' => $competition->id,
            'student_id' => $student->id,
            'coach_teacher_id' => $data['coach_teacher_id'] ?? null,
            'result' => $data['result'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        $this->logAudit($user?->id, 'competition_entry.register', 'competition_entries', $entry->id, null, $entry->toArray(), $request);

        return $entry->fresh(['competition', 'student', 'coach']);
    }

    public function updateEntry(string $id, array $data, Request $request): CompetitionEntry
    {
        $user = $request->user();
        $this->authorizeTeacherOrStaff($user);

        $entry = CompetitionEntry::findOrFail($id);
        $oldValues = $entry->toArray();

        $entry->update($data);

        $this->logAudit($user?->id, 'competition_entry.update', 'competition_entries', $entry->id, $oldValues, $entry->fresh()->toArray(), $request);

        return $entry->fresh(['competition', 'student', 'coach', 'achievement']);
    }

    public function deleteEntry(string $id, Request $request): bool
    {
        $user = $request->user();
        $this->authorizeTeacherOrStaff($user);

        $entry = CompetitionEntry::findOrFail($id);
        $oldValues = $entry->toArray();

        $entry->delete();

        $this->logAudit($user?->id, 'competition_entry.delete', 'competition_entries', $id, $oldValues, null, $request);

        return true;
    }

    // =========================================================================
    // 3. PRESTASI & GALERI PIALA (ACHIEVEMENTS)
    // =========================================================================

    public function listAchievements(array $filters): LengthAwarePaginator
    {
        $query = Achievement::with(['student', 'competition', 'certificateFile', 'photoFile'])
            ->orderBy('achieved_at', 'desc');

        if (! empty($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        if (! empty($filters['competition_id'])) {
            $query->where('competition_id', $filters['competition_id']);
        }

        if (! empty($filters['rank_level'])) {
            $query->where('rank_level', $filters['rank_level']);
        }

        if (! empty($filters['search'])) {
            $kw = '%'.strtolower($filters['search']).'%';
            $query->where(function ($q) use ($kw) {
                $q->whereRaw('LOWER(title) LIKE ?', [$kw])
                    ->orWhereRaw('LOWER(rank_level) LIKE ?', [$kw]);
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function getAchievement(string $id): Achievement
    {
        return Achievement::with(['student', 'competition', 'certificateFile', 'photoFile'])->findOrFail($id);
    }

    public function createAchievement(array $data, Request $request): Achievement
    {
        $user = $request->user();
        $this->authorizeTeacherOrStaff($user);

        $student = Student::findOrFail($data['student_id']);
        $pointsAwarded = (int) ($data['points_awarded'] ?? 0);

        // BE-STD-03: Otomatis tercatat sebagai poin prestasi ke student_points
        $pointType = null;
        if (! empty($data['point_type_id'])) {
            $pointType = PointType::find($data['point_type_id']);
            if ($pointType) {
                $pointsAwarded = $pointType->points;
            }
        }

        if (! $pointType) {
            $pointsAwarded = $pointsAwarded > 0 ? $pointsAwarded : 25;
            $pointType = PointType::firstOrCreate(
                ['kind' => 'prestasi', 'name' => 'Prestasi: '.$data['rank_level']],
                ['points' => $pointsAwarded, 'severity' => 'sedang']
            );
        }

        $achievement = Achievement::create([
            'student_id' => $student->id,
            'competition_id' => $data['competition_id'] ?? null,
            'title' => $data['title'],
            'rank_level' => $data['rank_level'],
            'achieved_at' => $data['achieved_at'],
            'certificate_file_id' => $data['certificate_file_id'] ?? null,
            'photo_file_id' => $data['photo_file_id'] ?? null,
            'points_awarded' => $pointsAwarded,
            'notes' => $data['notes'] ?? null,
        ]);

        // Catat ke student_points
        StudentPoint::create([
            'student_id' => $student->id,
            'point_type_id' => $pointType->id,
            'recorded_by' => $user->id,
            'point_date' => $data['achieved_at'],
            'evidence_file_id' => $data['certificate_file_id'] ?? $data['photo_file_id'] ?? null,
            'notes' => "Pencatatan otomatis prestasi: {$achievement->title} ({$achievement->rank_level})",
        ]);

        // Jika terhubung ke kompetisi, perbarui status hasil delegasi terkait
        if (! empty($data['competition_id'])) {
            $entry = CompetitionEntry::where('competition_id', $data['competition_id'])
                ->where('student_id', $student->id)
                ->first();

            if ($entry) {
                $entry->update([
                    'achievement_id' => $achievement->id,
                    'result' => $data['rank_level'],
                ]);
            }
        }

        $this->logAudit($user?->id, 'achievement.create', 'achievements', $achievement->id, null, $achievement->toArray(), $request);

        return $achievement->fresh(['student', 'competition', 'certificateFile', 'photoFile']);
    }

    public function updateAchievement(string $id, array $data, Request $request): Achievement
    {
        $user = $request->user();
        $this->authorizeTeacherOrStaff($user);

        $achievement = Achievement::findOrFail($id);
        $oldValues = $achievement->toArray();

        $achievement->update($data);

        $this->logAudit($user?->id, 'achievement.update', 'achievements', $achievement->id, $oldValues, $achievement->fresh()->toArray(), $request);

        return $achievement->fresh(['student', 'competition', 'certificateFile', 'photoFile']);
    }

    public function deleteAchievement(string $id, Request $request): bool
    {
        $user = $request->user();
        $this->authorizeStaffOrAdmin($user);

        $achievement = Achievement::findOrFail($id);
        $oldValues = $achievement->toArray();

        $achievement->delete();

        $this->logAudit($user?->id, 'achievement.delete', 'achievements', $id, $oldValues, null, $request);

        return true;
    }

    // =========================================================================
    // OTORISASI & AUDIT
    // =========================================================================

    public function isStaffOrAdmin(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole('admin') ||
            $user->hasRole('super_admin') ||
            $user->hasRole('kesiswaan') ||
            $user->hasRole('student_affairs');
    }

    public function isTeacherOrStaff(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->isStaffOrAdmin($user) ||
            $user->hasRole('teacher') ||
            $user->hasRole('homeroom_teacher') ||
            $user->hasRole('counselor') ||
            $user->hasPermission('student.point.write');
    }

    protected function authorizeTeacherOrStaff(?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        if (! $this->isTeacherOrStaff($user)) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang mengelola data lomba & prestasi.');
        }
    }

    protected function authorizeStaffOrAdmin(?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        if (! $this->isStaffOrAdmin($user)) {
            throw new HttpException(403, 'Akses ditolak: Hanya staf kesiswaan atau admin yang berwenang.');
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
            // Jangan gagalkan transaksi bila audit gagal
        }
    }
}
