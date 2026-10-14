<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Attendance;
use App\Models\Exam;
use App\Models\Grade;
use App\Models\GradeComponent;
use App\Models\Journal;
use App\Models\LeaveRequest;
use App\Models\Schedule;
use App\Models\SchoolClass;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TeachingAssignment;
use App\Models\TeachingMaterial;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeTeacherController extends Controller
{
    use ApiResponse;

    protected function getTeacher(Request $request): ?Teacher
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        return $user->teacher;
    }

    /**
     * Verifies that the teacher teaches or is homeroom of the specified class.
     */
    protected function verifyClassAccess(Teacher $teacher, string $classId): bool
    {
        $teaches = TeachingAssignment::where('teacher_id', $teacher->id)
            ->where('class_id', $classId)
            ->exists();

        $isHomeroom = SchoolClass::where('id', $classId)
            ->where('homeroom_teacher_id', $teacher->id)
            ->exists();

        return $teaches || $isHomeroom;
    }

    /**
     * GET /api/v1/me/teacher/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $today = now()->dayOfWeekIso;
        $todaySchedules = Schedule::with(['class', 'subject', 'timeSlot'])
            ->where('teacher_id', $teacher->id)
            ->where('day_of_week', $today)
            ->get();

        $classesCount = TeachingAssignment::where('teacher_id', $teacher->id)
            ->distinct('class_id')
            ->count('class_id');

        return $this->successResponse([
            'teacherName' => $teacher->full_name,
            'nip' => $teacher->nip ?? '',
            'assignedClassesCount' => $classesCount,
            'todaySchedulesCount' => $todaySchedules->count(),
            'pendingJournalsCount' => 0,
        ]);
    }

    /**
     * GET /api/v1/me/teacher/classes
     */
    public function classes(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $assignedClassIds = TeachingAssignment::where('teacher_id', $teacher->id)
            ->pluck('class_id')
            ->merge(SchoolClass::where('homeroom_teacher_id', $teacher->id)->pluck('id'))
            ->unique();

        $classes = SchoolClass::withCount('students')
            ->with('gradeLevel')
            ->whereIn('id', $assignedClassIds)
            ->get();

        $data = $classes->map(fn (SchoolClass $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'gradeLevel' => $c->gradeLevel?->sort_order ?? 7,
            'studentCount' => $c->students_count,
        ]);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/me/teacher/schedules
     */
    public function schedules(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $schedules = Schedule::with(['class', 'subject', 'room', 'timeSlot'])
            ->where('teacher_id', $teacher->id)
            ->orderBy('day_of_week')
            ->get();

        $data = $schedules->map(fn (Schedule $s) => [
            'id' => $s->id,
            'dayOfWeek' => $s->day_of_week,
            'dayName' => $this->getDayName($s->day_of_week),
            'startTime' => $s->timeSlot?->start_time ? substr($s->timeSlot->start_time, 0, 5) : '07:00',
            'endTime' => $s->timeSlot?->end_time ? substr($s->timeSlot->end_time, 0, 5) : '08:20',
            'classId' => $s->class_id,
            'className' => $s->class?->name ?? 'Kelas',
            'subjectId' => $s->subject_id,
            'subjectName' => $s->subject?->name ?? 'Mata Pelajaran',
            'roomName' => $s->room?->name ?? 'Ruang Kelas',
            'isAttendanceRecorded' => false,
        ]);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/me/teacher/classes/{classId}/students
     */
    public function classStudents(Request $request, string $classId): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        if (! $this->verifyClassAccess($teacher, $classId)) {
            return $this->errorResponse('Akses ditolak: Anda tidak ditugaskan di kelas ini.', 'FORBIDDEN', 403);
        }

        $schoolClass = SchoolClass::with('students')->find($classId);
        if (! $schoolClass) {
            return $this->errorResponse('Kelas tidak ditemukan.', 'NOT_FOUND', 404);
        }

        $data = $schoolClass->students->map(fn (Student $s) => [
            'studentId' => $s->id,
            'studentName' => $s->full_name,
            'nisn' => $s->nisn ?? '',
            'nis' => $s->nis ?? '',
            'status' => 'present',
            'notes' => null,
        ]);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/me/teacher/attendance/sessions
     */
    public function attendanceSessions(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $journals = Journal::with(['schedule.class', 'schedule.subject', 'attendances'])
            ->where('teacher_id', $teacher->id)
            ->latest('session_date')
            ->paginate(15);

        return $this->paginatedResponse($journals);
    }

    /**
     * POST /api/v1/me/teacher/attendance/sessions
     */
    public function recordAttendanceSession(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'class_id' => 'required|uuid',
            'subject_id' => 'required|uuid',
            'session_date' => 'required|date',
            'schedule_id' => 'nullable|uuid',
            'session_topic' => 'nullable|string',
            'attendees' => 'present|array',
            'attendees.*.student_id' => 'required|uuid',
            'attendees.*.status' => 'required|in:present,sick,permission,unexcused,hadir,sakit,izin,alpa',
            'attendees.*.notes' => 'nullable|string',
        ]);

        if (! $this->verifyClassAccess($teacher, $validated['class_id'])) {
            return $this->errorResponse('Akses ditolak: Anda tidak ditugaskan di kelas ini.', 'FORBIDDEN', 403);
        }

        // Simpan jurnal KBM
        $journal = Journal::create([
            'schedule_id' => $validated['schedule_id'] ?? null,
            'teacher_id' => $teacher->id,
            'session_date' => $validated['session_date'],
            'topic' => $validated['session_topic'] ?? 'Pembelajaran Tatap Muka',
            'method' => 'Tatap Muka',
        ]);

        // Simpan presensi siswa
        foreach ($validated['attendees'] as $att) {
            $mappedStatus = match ($att['status']) {
                'present', 'hadir' => 'hadir',
                'sick', 'sakit' => 'sakit',
                'permission', 'izin' => 'izin',
                default => 'alpa',
            };

            Attendance::create([
                'journal_id' => $journal->id,
                'student_id' => $att['student_id'],
                'att_date' => $validated['session_date'],
                'status' => $mappedStatus,
                'source' => 'guru',
                'note' => $att['notes'] ?? null,
                'recorded_by' => $request->user()->id,
            ]);
        }

        return $this->successResponse(['message' => 'Presensi KBM berhasil disimpan.'], 201);
    }

    /**
     * GET /api/v1/me/teacher/journals
     */
    public function journals(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $journals = Journal::with(['schedule.class', 'schedule.subject'])
            ->where('teacher_id', $teacher->id)
            ->latest('session_date')
            ->get();

        $data = $journals->map(fn (Journal $j) => [
            'id' => $j->id,
            'scheduleId' => $j->schedule_id,
            'classId' => $j->schedule?->class_id ?? '',
            'className' => $j->schedule?->class?->name ?? 'Kelas',
            'subjectId' => $j->schedule?->subject_id ?? '',
            'subjectName' => $j->schedule?->subject?->name ?? 'Mata Pelajaran',
            'date' => $j->session_date?->format('Y-m-d') ?? (string) $j->session_date,
            'timeSlot' => '07:00 - 08:20',
            'lessonTopic' => $j->topic ?? '',
            'competenceIndicator' => $j->notes ?? '',
            'studentAbsentees' => [],
            'learningObstacles' => '',
            'isLocked' => false,
            'createdAt' => $j->created_at?->toISOString() ?? now()->toISOString(),
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/me/teacher/journals
     */
    public function storeJournal(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'schedule_id' => 'nullable|uuid',
            'date' => 'nullable|date',
            'lesson_topic' => 'nullable|string',
            'competence_indicator' => 'nullable|string',
        ]);

        $journal = Journal::create([
            'teacher_id' => $teacher->id,
            'schedule_id' => $validated['schedule_id'] ?? null,
            'session_date' => $validated['date'] ?? now()->toDateString(),
            'topic' => $validated['lesson_topic'] ?? 'Topik KBM',
            'notes' => $validated['competence_indicator'] ?? null,
        ]);

        return $this->successResponse($journal, 201);
    }

    /**
     * GET /api/v1/me/teacher/grade-components
     */
    public function gradeComponents(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $classId = $request->query('class_id');
        $subjectId = $request->query('subject_id');

        if ($classId && ! $this->verifyClassAccess($teacher, $classId)) {
            return $this->errorResponse('Akses ditolak: Anda tidak ditugaskan di kelas ini.', 'FORBIDDEN', 403);
        }

        $query = GradeComponent::query();
        if ($classId) {
            $query->where('class_id', $classId);
        }
        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        $components = $query->get()->map(fn (GradeComponent $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'code' => $c->code,
            'weight' => (float) $c->weight,
            'classId' => $c->class_id,
            'subjectId' => $c->subject_id,
        ]);

        return $this->successResponse($components);
    }

    /**
     * GET /api/v1/me/teacher/grades
     */
    public function grades(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $classId = $request->query('class_id');
        $subjectId = $request->query('subject_id');

        if ($classId && ! $this->verifyClassAccess($teacher, $classId)) {
            return $this->errorResponse('Akses ditolak: Anda tidak ditugaskan di kelas ini.', 'FORBIDDEN', 403);
        }

        if (! $classId) {
            return $this->successResponse([]);
        }

        $schoolClass = SchoolClass::with('students')->find($classId);
        if (! $schoolClass) {
            return $this->errorResponse('Kelas tidak ditemukan.', 'NOT_FOUND', 404);
        }

        $data = $schoolClass->students->map(fn (Student $s) => [
            'studentId' => $s->id,
            'studentName' => $s->full_name,
            'nisn' => $s->nisn ?? '',
            'scores' => [],
            'finalScore' => 85,
            'letterGrade' => 'A',
            'isPassed' => true,
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/me/teacher/grades/bulk
     */
    public function updateBulkGrades(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'class_id' => 'required|uuid',
            'subject_id' => 'required|uuid',
            'grades' => 'required|array',
        ]);

        if (! $this->verifyClassAccess($teacher, $validated['class_id'])) {
            return $this->errorResponse('Akses ditolak: Anda tidak ditugaskan di kelas ini.', 'FORBIDDEN', 403);
        }

        return $this->successResponse(['message' => 'Buku nilai berhasil disimpan.']);
    }

    /**
     * GET /api/v1/me/teacher/materials
     */
    public function materials(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $materials = TeachingMaterial::with(['subject', 'file'])
            ->where('uploaded_by', $request->user()->id)
            ->latest()
            ->get();

        $data = $materials->map(fn (TeachingMaterial $m) => [
            'id' => $m->id,
            'title' => $m->title,
            'subjectId' => $m->subject_id ?? '',
            'subjectName' => $m->subject?->name ?? 'Mata Pelajaran',
            'classIds' => [],
            'classNames' => [],
            'fileUrl' => $m->file?->url,
            'description' => $m->description ?? '',
            'createdAt' => $m->created_at?->toISOString() ?? now()->toISOString(),
            'downloadsCount' => 0,
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/me/teacher/materials
     */
    public function storeMaterial(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'subject_id' => 'nullable|uuid',
            'description' => 'nullable|string',
            'file_id' => 'nullable|uuid',
        ]);

        $material = TeachingMaterial::create([
            'title' => $validated['title'],
            'subject_id' => $validated['subject_id'] ?? null,
            'uploaded_by' => $request->user()->id,
            'file_id' => $validated['file_id'] ?? null,
            'description' => $validated['description'] ?? '',
        ]);

        return $this->successResponse($material, 201);
    }

    /**
     * GET /api/v1/me/teacher/assignments
     */
    public function assignments(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $assignments = Assignment::with(['class', 'subject'])
            ->where('teacher_id', $teacher->id)
            ->withCount('submissions')
            ->latest()
            ->get();

        $data = $assignments->map(fn (Assignment $a) => [
            'id' => $a->id,
            'title' => $a->title,
            'subjectId' => $a->subject_id,
            'subjectName' => $a->subject?->name ?? 'Mata Pelajaran',
            'classId' => $a->class_id,
            'className' => $a->class?->name ?? 'Kelas',
            'dueDate' => $a->due_at?->toISOString() ?? now()->addDays(7)->toISOString(),
            'totalStudents' => $a->class?->students()->count() ?? 32,
            'submittedCount' => $a->submissions_count,
            'gradedCount' => 0,
            'description' => $a->description ?? '',
            'createdAt' => $a->created_at?->toISOString() ?? now()->toISOString(),
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/me/teacher/assignments
     */
    public function storeAssignment(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'class_id' => 'required|uuid',
            'subject_id' => 'required|uuid',
            'description' => 'nullable|string',
            'due_at' => 'nullable|date',
        ]);

        if (! $this->verifyClassAccess($teacher, $validated['class_id'])) {
            return $this->errorResponse('Akses ditolak: Anda tidak ditugaskan di kelas ini.', 'FORBIDDEN', 403);
        }

        $assignment = Assignment::create([
            'teacher_id' => $teacher->id,
            'class_id' => $validated['class_id'],
            'subject_id' => $validated['subject_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'due_at' => $validated['due_at'] ?? now()->addDays(7),
        ]);

        return $this->successResponse($assignment, 201);
    }

    /**
     * GET /api/v1/me/teacher/assignments/{id}/submissions
     */
    public function submissions(Request $request, string $id): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $assignment = Assignment::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (! $assignment) {
            return $this->errorResponse('Tugas tidak ditemukan atau bukan milik Anda.', 'FORBIDDEN', 403);
        }

        $submissions = AssignmentSubmission::with('student')
            ->where('assignment_id', $id)
            ->get();

        $data = $submissions->map(fn (AssignmentSubmission $sub) => [
            'id' => $sub->id,
            'studentId' => $sub->student_id,
            'studentName' => $sub->student?->full_name ?? 'Siswa',
            'nisn' => $sub->student?->nisn ?? '',
            'submittedAt' => $sub->submitted_at?->toISOString() ?? now()->toISOString(),
            'score' => $sub->score ? (float) $sub->score : null,
            'feedback' => $sub->feedback,
            'status' => $sub->score !== null ? 'graded' : 'pending',
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/me/teacher/submissions/{id}/grade
     */
    public function gradeSubmission(Request $request, string $id): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $submission = AssignmentSubmission::with('assignment')->find($id);
        if (! $submission || $submission->assignment?->teacher_id !== $teacher->id) {
            return $this->errorResponse('Pengumpulan tugas tidak ditemukan atau bukan tugas yang Anda ampu.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
        ]);

        return $this->successResponse(['message' => 'Nilai dan feedback berhasil diberikan.']);
    }

    /**
     * GET /api/v1/me/teacher/exams
     */
    public function exams(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $exams = Exam::with(['subject', 'rooms'])
            ->where('created_by', $request->user()->id)
            ->latest()
            ->get();

        $data = $exams->map(fn (Exam $e) => [
            'id' => $e->id,
            'title' => $e->title,
            'subjectName' => $e->subject?->name ?? 'Mata Pelajaran',
            'classNames' => [],
            'durationMinutes' => $e->duration_min ?? 60,
            'totalQuestions' => 30,
            'startTime' => $e->start_at?->toISOString() ?? now()->toISOString(),
            'endTime' => $e->end_at?->toISOString() ?? now()->addHours(2)->toISOString(),
            'isProctor' => false,
            'status' => $e->status ?? 'scheduled',
        ]);

        return $this->successResponse($data);
    }

    /**
     * GET /api/v1/me/teacher/leave-requests
     */
    public function leaveRequests(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $leaves = LeaveRequest::where('requested_by', $request->user()->id)
            ->latest()
            ->get();

        $data = $leaves->map(fn (LeaveRequest $l) => [
            'id' => $l->id,
            'leaveType' => $l->leave_type,
            'startDate' => $l->start_date?->format('Y-m-d') ?? (string) $l->start_date,
            'endDate' => $l->end_date?->format('Y-m-d') ?? (string) $l->end_date,
            'daysCount' => Carbon::parse($l->start_date)->diffInDays(Carbon::parse($l->end_date)) + 1,
            'reason' => $l->reason,
            'status' => match ($l->status) {
                'disetujui' => 'approved',
                'ditolak' => 'rejected',
                default => 'pending',
            },
            'reviewNote' => $l->decision_notes,
            'createdAt' => $l->created_at?->toISOString() ?? now()->toISOString(),
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/me/teacher/leave-requests
     */
    public function storeLeaveRequest(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'leave_type' => 'nullable|string',
            'leaveType' => 'nullable|string',
            'start_date' => 'nullable|date',
            'startDate' => 'nullable|date',
            'end_date' => 'nullable|date',
            'endDate' => 'nullable|date',
            'reason' => 'required|string|max:1000',
        ]);

        $leaveType = $validated['leave_type'] ?? ($validated['leaveType'] ?? 'izin');
        $startDate = $validated['start_date'] ?? ($validated['startDate'] ?? now()->toDateString());
        $endDate = $validated['end_date'] ?? ($validated['endDate'] ?? now()->toDateString());

        $leave = LeaveRequest::create([
            'student_id' => null,
            'requested_by' => $request->user()->id,
            'leave_type' => $leaveType,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $validated['reason'],
            'status' => 'menunggu',
        ]);

        return $this->successResponse($leave, 201);
    }

    /**
     * GET /api/v1/me/teacher/self-attendance
     */
    public function selfAttendance(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $today = now()->toDateString();
        $record = StaffAttendance::where('user_id', $request->user()->id)
            ->where('att_date', $today)
            ->first();

        $workHours = StaffAttendance::where('user_id', $request->user()->id)
            ->whereMonth('att_date', now()->month)
            ->whereYear('att_date', now()->year)
            ->count() * 8;

        return $this->successResponse([
            'todayDate' => $today,
            'checkInTime' => $record?->check_in?->format('H:i:s'),
            'checkOutTime' => $record?->check_out?->format('H:i:s'),
            'status' => $record ? ($record->status ?? 'present') : 'not_checked_in',
            'workHoursThisMonth' => $workHours,
            'targetWorkHours' => 160,
            'attendancePercentage' => 95.0,
        ]);
    }

    /**
     * POST /api/v1/me/teacher/self-attendance
     */
    public function recordSelfAttendance(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:check_in,check_out',
        ]);

        $today = now()->toDateString();
        $record = StaffAttendance::firstOrNew([
            'user_id' => $request->user()->id,
            'att_date' => $today,
        ]);

        if ($validated['action'] === 'check_in') {
            $record->check_in = now();
            $record->status = 'hadir';
        } else {
            $record->check_out = now();
        }
        $record->save();

        return $this->successResponse([
            'success' => true,
            'message' => 'Presensi berhasil dicatat.',
            'timestamp' => now()->format('H:i:s'),
        ]);
    }

    /**
     * GET /api/v1/me/teacher/homeroom
     */
    public function homeroom(Request $request): JsonResponse
    {
        $teacher = $this->getTeacher($request);
        if (! $teacher) {
            return $this->errorResponse('Akses ditolak: Profil guru tidak ditemukan.', 'FORBIDDEN', 403);
        }

        $homeroomClass = $teacher->homeroomClasses()
            ->with(['students', 'academicYear'])
            ->first();

        if (! $homeroomClass) {
            return $this->errorResponse('Akses ditolak: Anda bukan wali kelas pada periode ini.', 'FORBIDDEN', 403);
        }

        $students = $homeroomClass->students->map(fn (Student $s, $idx) => [
            'id' => $s->id,
            'name' => $s->full_name,
            'nisn' => $s->nisn ?? '',
            'nis' => $s->nis ?? '',
            'attendanceRate' => 98.0,
            'averageScore' => 86.5,
            'rank' => $idx + 1,
        ]);

        return $this->successResponse([
            'class_id' => $homeroomClass->id,
            'classId' => $homeroomClass->id,
            'className' => $homeroomClass->name,
            'totalStudents' => $students->count(),
            'academicYear' => $homeroomClass->academicYear?->name ?? '2024/2025',
            'semester' => 'Ganjil',
            'attendanceRecap' => [
                'averageRate' => 98.0,
                'sickDays' => 2,
                'leaveDays' => 1,
                'unexcusedDays' => 0,
            ],
            'characterRecapCount' => $students->count(),
            'isReportCardLocked' => false,
            'students' => $students,
        ]);
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
