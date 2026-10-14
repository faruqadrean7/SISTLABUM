<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Attendance;
use App\Models\CounselingRequest;
use App\Models\ExamParticipant;
use App\Models\Grade;
use App\Models\Schedule;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeStudentController extends Controller
{
    use ApiResponse;

    protected function getStudent(Request $request): ?Student
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        return $user->student;
    }

    /**
     * GET /api/v1/me/student-dashboard
     * Ringkasan beranda siswa aktif.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        if (! $student) {
            return $this->errorResponse('Akses ditolak: Profil siswa tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $student->loadMissing(['classes.academicYear']);
        $currentClass = $student->classes->first();

        // Presensi
        $totalAtt = Attendance::where('student_id', $student->id)->count();
        $presentAtt = Attendance::where('student_id', $student->id)->where('status', 'hadir')->count();
        $attendanceRate = $totalAtt > 0 ? round(($presentAtt / $totalAtt) * 100, 1) : 100.0;

        // Jadwal hari ini (dayOfWeek: 1 = Senin, 7 = Minggu)
        $todayDayOfWeek = now()->dayOfWeekIso;
        $todaySchedules = [];
        if ($currentClass) {
            $schedules = Schedule::with(['subject', 'teacher', 'room', 'timeSlot'])
                ->where('class_id', $currentClass->id)
                ->where('day_of_week', $todayDayOfWeek)
                ->get();

            $todaySchedules = $schedules->map(fn (Schedule $s) => [
                'id' => $s->id,
                'dayOfWeek' => $s->day_of_week,
                'dayName' => $this->getDayName($s->day_of_week),
                'startTime' => $s->timeSlot?->start_time ? substr($s->timeSlot->start_time, 0, 5) : '07:00',
                'endTime' => $s->timeSlot?->end_time ? substr($s->timeSlot->end_time, 0, 5) : '08:20',
                'subjectName' => $s->subject?->name ?? 'Mata Pelajaran',
                'teacherName' => $s->teacher?->full_name ?? 'Guru Pengampu',
                'roomName' => $s->room?->name ?? ($currentClass->name ?? 'Ruang Kelas'),
            ])->values()->all();
        }

        // Ujian CBT mendatang
        $exams = ExamParticipant::with('exam.subject')
            ->where('student_id', $student->id)
            ->limit(5)
            ->get()
            ->map(fn (ExamParticipant $p) => [
                'id' => $p->exam_id,
                'title' => $p->exam?->title ?? 'Ujian CBT',
                'subjectName' => $p->exam?->subject?->name ?? 'Mata Pelajaran',
                'durationMinutes' => $p->exam?->duration_min ?? 60,
                'totalQuestions' => 30,
                'startTime' => $p->exam?->start_at?->toISOString() ?? now()->toISOString(),
                'endTime' => $p->exam?->end_at?->toISOString() ?? now()->addHours(1)->toISOString(),
                'status' => $p->exam?->status ?? 'scheduled',
            ])->values()->all();

        // Total prestasi
        $achievementsCount = Achievement::where('student_id', $student->id)->count();

        return $this->successResponse([
            'name' => $student->full_name,
            'nis' => $student->nis ?? '',
            'nisn' => $student->nisn ?? '',
            'className' => $currentClass?->name ?? 'Belum ada kelas',
            'todaySchedule' => $todaySchedules,
            'upcomingExams' => $exams,
            'attendanceRate' => $attendanceRate,
            'totalAchievements' => $achievementsCount,
        ]);
    }

    /**
     * GET /api/v1/me/schedule
     * Jadwal pelajaran mingguan siswa aktif.
     */
    public function schedule(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        if (! $student) {
            return $this->errorResponse('Akses ditolak: Profil siswa tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $currentClass = $student->classes()->first();
        if (! $currentClass) {
            return $this->successResponse([]);
        }

        $schedules = Schedule::with(['subject', 'teacher', 'room', 'timeSlot'])
            ->where('class_id', $currentClass->id)
            ->orderBy('day_of_week')
            ->get();

        $data = $schedules->map(fn (Schedule $s) => [
            'id' => $s->id,
            'dayOfWeek' => $s->day_of_week,
            'dayName' => $this->getDayName($s->day_of_week),
            'startTime' => $s->timeSlot?->start_time ? substr($s->timeSlot->start_time, 0, 5) : '07:00',
            'endTime' => $s->timeSlot?->end_time ? substr($s->timeSlot->end_time, 0, 5) : '08:20',
            'subjectName' => $s->subject?->name ?? 'Mata Pelajaran',
            'teacherName' => $s->teacher?->full_name ?? 'Guru Pengampu',
            'roomName' => $s->room?->name ?? ($currentClass->name ?? 'Ruang Kelas'),
        ]);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/me/grades
     * Nilai pembelajaran siswa aktif.
     */
    public function grades(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        if (! $student) {
            return $this->errorResponse('Akses ditolak: Profil siswa tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $grades = Grade::with(['component.subject'])
            ->where('student_id', $student->id)
            ->get()
            ->groupBy(fn ($g) => $g->component?->subject_id ?? 'unknown');

        $result = [];
        foreach ($grades as $subjectId => $items) {
            $first = $items->first();
            $subject = $first?->component?->subject;
            $avgScore = round($items->avg('value') ?? 0, 1);

            $result[] = [
                'subjectId' => (string) $subjectId,
                'subjectName' => $subject?->name ?? 'Mata Pelajaran',
                'subjectCode' => $subject?->code ?? '',
                'teacherName' => 'Guru Pengampu',
                'finalScore' => $avgScore,
                'letterGrade' => $avgScore >= 85 ? 'A' : ($avgScore >= 75 ? 'B' : 'C'),
                'isPassed' => $avgScore >= 75,
            ];
        }

        return $this->successResponse($result);
    }

    /**
     * GET /api/v1/me/exams
     * Jadwal ujian CBT siswa.
     */
    public function exams(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        if (! $student) {
            return $this->errorResponse('Akses ditolak: Profil siswa tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $participants = ExamParticipant::with('exam.subject')
            ->where('student_id', $student->id)
            ->get();

        $data = $participants->map(fn (ExamParticipant $p) => [
            'id' => $p->exam_id,
            'title' => $p->exam?->title ?? 'Ujian CBT',
            'subjectName' => $p->exam?->subject?->name ?? 'Mata Pelajaran',
            'durationMinutes' => $p->exam?->duration_min ?? 60,
            'totalQuestions' => 30,
            'startTime' => $p->exam?->start_at?->toISOString() ?? now()->toISOString(),
            'endTime' => $p->exam?->end_at?->toISOString() ?? now()->addHours(1)->toISOString(),
            'status' => $p->exam?->status ?? 'scheduled',
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/me/counseling-requests
     * Pengajuan permohonan konseling mandiri siswa.
     */
    public function storeCounselingRequest(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        if (! $student) {
            return $this->errorResponse('Akses ditolak: Profil siswa tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
            'preferred_date' => 'nullable|date',
            'preferred_time' => 'nullable|string',
            'is_urgent' => 'nullable|boolean',
        ]);

        $topic = $validated['topic'] ?? ($validated['reason'] ?? 'Konseling Mandiri');
        $counseling = CounselingRequest::create([
            'student_id' => $student->id,
            'requested_by' => $request->user()->id,
            'requester_role' => 'student',
            'topic' => $topic,
            'notes' => $validated['reason'] ?? null,
            'preferred_date' => $validated['preferred_date'] ?? null,
            'preferred_time' => $validated['preferred_time'] ?? null,
            'status' => 'pending',
        ]);

        return $this->successResponse($counseling, 201);
    }

    private function getDayName(int $dayOfWeek): string
    {
        return match ($dayOfWeek) {
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            default => 'Minggu',
        };
    }
}
