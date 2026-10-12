<?php

namespace App\Services\Rpt;

use App\Models\Asset;
use App\Models\Attendance;
use App\Models\CounselingCase;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Grade;
use App\Models\GradeComponent;
use App\Models\Guardian;
use App\Models\Loan;
use App\Models\Schedule;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\StudentPoint;
use App\Models\Teacher;
use App\Models\TeachingAssignment;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DashboardService
{
    /**
     * BE-RPT-02: Dashboard Eksekutif untuk Pimpinan / Kepala Sekolah.
     * Metrik agregat di-cache 1-5 menit, kecuali metrik CBT Live (real-time).
     */
    public function getExecutiveDashboard(Request $request): array
    {
        $user = $request->user();
        $this->authorizeExecutive($user);

        // 1. CBT Live (Real-Time, TIDAK di-cache)
        $now = Carbon::now();
        $cbtLive = [
            'active_students_count' => ExamSession::where('status', 'in_progress')->count(),
            'ongoing_exams_count' => Exam::where(function ($q) {
                $q->whereIn('status', ['berlangsung', 'dijadwalkan', 'published']);
            })->where(function ($q) use ($now) {
                $q->where(fn ($sub) => $sub->where('start_at', '<=', $now)->where('end_at', '>=', $now))
                    ->orWhere(fn ($sub) => $sub->where('start_time', '<=', $now)->where('end_time', '>=', $now));
            })->count(),
            'active_rooms_count' => ExamSession::where('exam_sessions.status', 'in_progress')
                ->join('exams', 'exam_sessions.exam_id', '=', 'exams.id')
                ->distinct('exams.id')
                ->count('exams.id'),
        ];

        // 2. Metrik Agregat Ter-cache (Cache 2 Menit / 120 Detik)
        $cachedMetrics = Cache::remember('dashboard_executive_metrics', 120, function () {
            $today = Carbon::today()->toDateString();

            // A. Kehadiran Hari Ini (Siswa & Guru/Staf)
            $studentAtts = Attendance::whereDate('att_date', Carbon::today())
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $totalStudentAtt = array_sum($studentAtts);
            $studentHadir = $studentAtts['hadir'] ?? 0;

            $staffAtts = StaffAttendance::whereDate('att_date', Carbon::today())
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $totalStaffAtt = array_sum($staffAtts);
            $staffHadir = $staffAtts['hadir'] ?? 0;

            $attendanceToday = [
                'date' => $today,
                'students' => [
                    'total_recorded' => $totalStudentAtt,
                    'hadir' => $studentHadir,
                    'izin' => $studentAtts['izin'] ?? 0,
                    'sakit' => $studentAtts['sakit'] ?? 0,
                    'alpa' => $studentAtts['alpa'] ?? 0,
                    'terlambat' => $studentAtts['terlambat'] ?? 0,
                    'rate' => $totalStudentAtt > 0 ? round(($studentHadir / $totalStudentAtt) * 100, 2) : 0,
                ],
                'staff' => [
                    'total_recorded' => $totalStaffAtt,
                    'hadir' => $staffHadir,
                    'terlambat' => $staffAtts['terlambat'] ?? 0,
                    'izin' => $staffAtts['izin'] ?? 0,
                    'rate' => $totalStaffAtt > 0 ? round(($staffHadir / $totalStaffAtt) * 100, 2) : 0,
                ],
            ];

            // B. Ketercapaian Silabus & Pengajaran
            $totalSchedules = Schedule::count();
            $schedulesWithJournals = Schedule::has('journals')->count();
            $syllabusCompletionRate = $totalSchedules > 0
                ? round(($schedulesWithJournals / $totalSchedules) * 100, 2)
                : 0;

            $syllabusCompletion = [
                'total_schedules' => $totalSchedules,
                'active_with_journals' => $schedulesWithJournals,
                'completion_rate' => $syllabusCompletionRate,
            ];

            // C. Persentase Guru Tuntas Nilai
            $totalComponents = GradeComponent::count();
            $componentsWithGrades = GradeComponent::whereHas('grades')->count();
            $gradingCompletionRate = $totalComponents > 0
                ? round(($componentsWithGrades / $totalComponents) * 100, 2)
                : 0;

            $teacherGradingCompletion = [
                'total_components' => $totalComponents,
                'completed_components' => $componentsWithGrades,
                'completion_rate' => $gradingCompletionRate,
            ];

            // D. Rerata Nilai per Angkatan / Tingkat
            $gradesByLevel = DB::table('grades')
                ->join('students', 'grades.student_id', '=', 'students.id')
                ->join('class_students', 'students.id', '=', 'class_students.student_id')
                ->join('classes', 'class_students.class_id', '=', 'classes.id')
                ->join('grade_levels', 'classes.grade_level_id', '=', 'grade_levels.id')
                ->select('grade_levels.id as grade_level_id', 'grade_levels.name', 'grade_levels.sort_order', DB::raw('avg(grades.value) as avg_value'), DB::raw('count(grades.id) as count'))
                ->groupBy('grade_levels.id', 'grade_levels.name', 'grade_levels.sort_order')
                ->orderBy('grade_levels.sort_order')
                ->get()
                ->map(fn ($row) => [
                    'grade_level_id' => $row->grade_level_id,
                    'level_name' => $row->name,
                    'sort_order' => (int) $row->sort_order,
                    'average_score' => round((float) $row->avg_value, 2),
                    'grades_count' => (int) $row->count,
                ]);

            // E. Kasus Kesiswaan Tindak Lanjut
            $activeCounselingCases = CounselingCase::where('status', '!=', 'selesai')->count();
            $recentViolations = StudentPoint::whereHas('pointType', fn ($q) => $q->where('kind', 'pelanggaran'))
                ->where('point_date', '>=', Carbon::now()->subDays(30)->toDateString())
                ->count();

            $studentAffairsFollowUp = [
                'active_counseling_cases' => $activeCounselingCases,
                'recent_violations_count' => $recentViolations,
            ];

            // F. Status Sarpras Kritis
            $criticalTickets = Ticket::where(function ($q) {
                $q->where('priority', 'darurat')
                    ->orWhere(fn ($sub) => $sub->where('priority', 'tinggi')->where('status', 'pending'));
            })->count();

            $damagedAssets = Asset::where('condition', 'rusak_berat')->count();

            $infrastructureStatus = [
                'critical_tickets_count' => $criticalTickets,
                'heavily_damaged_assets' => $damagedAssets,
            ];

            return [
                'attendance_today' => $attendanceToday,
                'syllabus_completion' => $syllabusCompletion,
                'teacher_grading_completion' => $teacherGradingCompletion,
                'grades_by_grade_level' => $gradesByLevel,
                'student_affairs_follow_up' => $studentAffairsFollowUp,
                'infrastructure_status' => $infrastructureStatus,
                'cached_at' => Carbon::now()->toIso8601String(),
            ];
        });

        return array_merge([
            'cbt_live' => $cbtLive,
        ], $cachedMetrics);
    }

    /**
     * BE-RPT-02: Dashboard Guru.
     */
    public function getTeacherDashboard(Request $request): array
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $teacher = Teacher::where('user_id', $user->id)->first();
        if (! $teacher && ! $user->hasRole(['super_admin', 'admin'])) {
            throw new HttpException(403, 'Akses ditolak: Profil guru tidak ditemukan.');
        }

        $teacherId = $teacher?->id;
        $dayNames = [
            1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis',
            5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu',
        ];
        $todayDay = $dayNames[Carbon::now()->dayOfWeekIso] ?? 'Senin';

        $assignmentsCount = $teacherId ? TeachingAssignment::where('teacher_id', $teacherId)->count() : 0;
        $todaySchedules = $teacherId
            ? Schedule::where('teacher_id', $teacherId)
                ->where('day_of_week', $todayDay)
                ->with(['schoolClass', 'subject', 'timeSlot'])
                ->get()
            : collect([]);

        $pendingJournals = $teacherId
            ? Schedule::where('teacher_id', $teacherId)
                ->whereDoesntHave('journals', fn ($q) => $q->whereDate('date', Carbon::today()))
                ->count()
            : 0;

        return [
            'teacher' => [
                'id' => $teacher?->id,
                'name' => $teacher?->full_name ?? $user->username,
                'nip' => $teacher?->nip,
            ],
            'teaching_classes_count' => $assignmentsCount,
            'today_day' => $todayDay,
            'today_schedules' => $todaySchedules,
            'pending_journals_count' => $pendingJournals,
        ];
    }

    /**
     * BE-RPT-02: Dashboard Siswa.
     */
    public function getStudentDashboard(Request $request): array
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $student = Student::where('user_id', $user->id)->first();
        if (! $student && ! $user->hasRole(['super_admin', 'admin'])) {
            throw new HttpException(403, 'Akses ditolak: Profil siswa tidak ditemukan.');
        }

        $studentId = $student?->id;
        $activeClass = $student?->classes()->first();

        $todayAttendance = $studentId
            ? Attendance::where('student_id', $studentId)->whereDate('att_date', Carbon::today())->first()
            : null;

        $totalAtt = $studentId ? Attendance::where('student_id', $studentId)->count() : 0;
        $hadirAtt = $studentId ? Attendance::where('student_id', $studentId)->where('status', 'hadir')->count() : 0;
        $attendanceRate = $totalAtt > 0 ? round(($hadirAtt / $totalAtt) * 100, 2) : 100;

        // Poin Prestasi & Pelanggaran
        $prestasiPoints = $studentId
            ? (int) StudentPoint::where('student_id', $studentId)
                ->whereHas('pointType', fn ($q) => $q->where('kind', 'prestasi'))
                ->join('point_types', 'student_points.point_type_id', '=', 'point_types.id')
                ->sum('point_types.points')
            : 0;

        $pelanggaranPoints = $studentId
            ? (int) StudentPoint::where('student_id', $studentId)
                ->whereHas('pointType', fn ($q) => $q->where('kind', 'pelanggaran'))
                ->join('point_types', 'student_points.point_type_id', '=', 'point_types.id')
                ->sum('point_types.points')
            : 0;

        $unreturnedLoans = Loan::where('borrower_id', $user->id)
            ->whereNull('returned_at')
            ->count();

        $now = Carbon::now();
        $upcomingExams = Exam::whereIn('status', ['dijadwalkan', 'berlangsung', 'published'])
            ->where(function ($q) use ($now) {
                $q->where('end_at', '>=', $now)
                    ->orWhere('end_time', '>=', $now);
            })
            ->limit(5)
            ->get();

        return [
            'student' => [
                'id' => $student?->id,
                'name' => $student?->full_name ?? $user->username,
                'nis' => $student?->nis,
                'class' => $activeClass?->name,
            ],
            'attendance' => [
                'today_status' => $todayAttendance?->status ?? 'belum_tercatat',
                'today_note' => $todayAttendance?->note,
                'rate' => $attendanceRate,
                'total_recorded' => $totalAtt,
            ],
            'points' => [
                'prestasi' => $prestasiPoints,
                'pelanggaran' => $pelanggaranPoints,
                'balance' => $prestasiPoints - $pelanggaranPoints,
            ],
            'library' => [
                'unreturned_loans_count' => $unreturnedLoans,
            ],
            'upcoming_exams' => $upcomingExams,
        ];
    }

    /**
     * BE-RPT-02: Dashboard Wali Murid / Orang Tua (Anti-IDOR Check).
     */
    public function getGuardianDashboard(string $studentId, Request $request): array
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $student = Student::with('classes')->findOrFail($studentId);

        // Anti-IDOR: Periksa relasi kepemilikan anak asuh
        $isAdmin = $user->hasRole(['super_admin', 'admin', 'principal']);
        if (! $isAdmin) {
            $guardian = Guardian::where('user_id', $user->id)->first();
            if (! $guardian) {
                throw new HttpException(403, 'Akses ditolak: Akun Anda tidak terdaftar sebagai wali murid.');
            }

            $isChild = $guardian->students()->where('students.id', $studentId)->exists();
            if (! $isChild) {
                throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang mengakses data siswa ini.');
            }
        }

        $todayAttendance = Attendance::where('student_id', $studentId)->whereDate('att_date', Carbon::today())->first();

        $attCounts = Attendance::where('student_id', $studentId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $latestGrades = Grade::where('student_id', $studentId)
            ->with(['component'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $prestasiPoints = (int) StudentPoint::where('student_id', $studentId)
            ->whereHas('pointType', fn ($q) => $q->where('kind', 'prestasi'))
            ->join('point_types', 'student_points.point_type_id', '=', 'point_types.id')
            ->sum('point_types.points');

        $pelanggaranPoints = (int) StudentPoint::where('student_id', $studentId)
            ->whereHas('pointType', fn ($q) => $q->where('kind', 'pelanggaran'))
            ->join('point_types', 'student_points.point_type_id', '=', 'point_types.id')
            ->sum('point_types.points');

        return [
            'student' => [
                'id' => $student->id,
                'name' => $student->full_name,
                'nis' => $student->nis,
                'class' => $student->classes->first()?->name,
            ],
            'attendance_today' => [
                'status' => $todayAttendance?->status ?? 'belum_tercatat',
                'note' => $todayAttendance?->note,
            ],
            'attendance_summary' => [
                'hadir' => $attCounts['hadir'] ?? 0,
                'izin' => $attCounts['izin'] ?? 0,
                'sakit' => $attCounts['sakit'] ?? 0,
                'alpa' => $attCounts['alpa'] ?? 0,
                'terlambat' => $attCounts['terlambat'] ?? 0,
            ],
            'latest_grades' => $latestGrades,
            'character_points' => [
                'prestasi' => $prestasiPoints,
                'pelanggaran' => $pelanggaranPoints,
                'balance' => $prestasiPoints - $pelanggaranPoints,
            ],
        ];
    }

    protected function authorizeExecutive(?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $allowed = $user->hasRole(['super_admin', 'admin', 'principal', 'admin_tu', 'kurikulum', 'kesiswaan']) ||
            $user->hasPermission('dashboard.executive');

        if (! $allowed) {
            throw new HttpException(403, 'Akses ditolak: Anda tidak memiliki wewenang mengakses Dashboard Eksekutif.');
        }
    }
}
