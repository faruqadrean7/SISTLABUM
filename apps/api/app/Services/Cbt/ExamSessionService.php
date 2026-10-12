<?php

namespace App\Services\Cbt;

use App\Models\AuditLog;
use App\Models\Exam;
use App\Models\ExamAnswer;
use App\Models\ExamParticipant;
use App\Models\ExamProctorAction;
use App\Models\ExamQuestion;
use App\Models\ExamRoom;
use App\Models\ExamSession;
use App\Models\ExamViolation;
use App\Models\Question;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExamSessionService
{
    /**
     * BE-CBT-04: Mulai atau lanjutkan sesi ujian siswa dengan verifikasi token ruang ujian.
     */
    public function startOrResumeSession(string $examId, array $data, Request $request): array
    {
        $user = $request->user();
        $student = $this->resolveStudentForUser($user);

        $exam = Exam::with('rooms')->findOrFail($examId);

        if (in_array($exam->status, ['arsip', 'selesai'])) {
            throw new HttpException(422, 'Ujian ini sudah ditutup atau diarsipkan.');
        }

        // Cari data pendaftaran peserta ujian
        $participant = ExamParticipant::where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->first();

        if (! $participant) {
            throw new HttpException(403, 'Anda tidak terdaftar sebagai peserta pada ujian ini.');
        }

        // Verifikasi token ruang ujian
        $tokenInput = trim(strtoupper($data['token'] ?? ''));
        $examRoom = null;

        if ($participant->exam_room_id) {
            $examRoom = ExamRoom::where('id', $participant->exam_room_id)->first();
        }

        if (! $examRoom) {
            $examRoom = ExamRoom::where('exam_id', $exam->id)
                ->where('token', $tokenInput)
                ->first();
        }

        if (! $examRoom || strtoupper($examRoom->token) !== $tokenInput) {
            throw new HttpException(422, 'Token ruang ujian tidak valid atau tidak cocok.');
        }

        if ($examRoom->token_expires_at && Carbon::now()->greaterThan($examRoom->token_expires_at)) {
            throw new HttpException(422, 'Token ruang ujian telah kedaluwarsa. Silakan minta pengawas untuk me-regenerate token.');
        }

        // Pastikan ruang peserta terhubung ke exam_room_id ini
        if ($participant->exam_room_id !== $examRoom->id) {
            $participant->update(['exam_room_id' => $examRoom->id]);
        }

        $now = Carbon::now();
        $durationMinutes = (int) ($exam->duration_min ?? 90);

        // Cari atau buat sesi ujian siswa secara aman terhadap konkurensi
        try {
            $session = ExamSession::firstOrCreate(
                [
                    'exam_id' => $exam->id,
                    'student_id' => $student->id,
                ],
                [
                    'status' => 'mengerjakan',
                    'started_at' => $now,
                    'deadline_at' => $now->copy()->addMinutes($durationMinutes),
                    'seed' => Str::random(16),
                    'extra_minutes' => 0,
                ]
            );
        } catch (UniqueConstraintViolationException) {
            $session = ExamSession::where('exam_id', $exam->id)
                ->where('student_id', $student->id)
                ->firstOrFail();
        }

        // Jika sesi sudah pernah dibuat tapi statusnya 'belum'
        if ($session->status === 'belum') {
            $session->status = 'mengerjakan';
            $session->started_at = $now;
            $session->deadline_at = $now->copy()->addMinutes($durationMinutes + $session->extra_minutes);
            $session->save();
        } elseif ($session->status === 'selesai') {
            throw new HttpException(422, 'Ujian telah Anda selesaikan sebelumnya dan tidak dapat diakses kembali.');
        } elseif ($session->status === 'terkunci') {
            throw new HttpException(403, 'Sesi ujian Anda sedang terkunci: '.($session->locked_reason ?? 'Pelanggaran anti-cheat atau aturan ujian').'. Hubungi pengawas ruang.');
        }

        // Auto-lock jika waktu server telah melewati deadline
        if ($session->deadline_at && $now->greaterThan($session->deadline_at)) {
            $session->status = 'selesai';
            $session->submitted_at = $session->deadline_at;
            $session->save();
            throw new HttpException(422, 'Waktu ujian telah habis. Sesi ujian otomatis diselesaikan.');
        }

        $remainingSeconds = max(0, $now->diffInSeconds($session->deadline_at, false));

        $this->logAudit(
            $user->id,
            'exam.start_session',
            'exam_sessions',
            $session->id,
            null,
            ['status' => $session->status, 'started_at' => $session->started_at?->toIso8601String()],
            $request
        );

        return [
            'session_id' => $session->id,
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'student_id' => $student->id,
            'student_name' => $student->full_name,
            'status' => $session->status,
            'started_at' => $session->started_at?->toIso8601String(),
            'deadline_at' => $session->deadline_at?->toIso8601String(),
            'extra_minutes' => $session->extra_minutes,
            'remaining_seconds' => $remainingSeconds,
            'server_time' => $now->toIso8601String(),
            'room_name' => $examRoom->room?->name,
            'session_no' => $examRoom->session_no,
        ];
    }

    /**
     * BE-CBT-04: Ambil daftar butir soal untuk sesi ujian siswa.
     * ATURAN KEAMANAN: Kunci jawaban dan bobot nilai sensitif DIBERSIHKAN!
     */
    public function getSessionQuestions(string $examId, Request $request): array
    {
        $user = $request->user();
        $student = $this->resolveStudentForUser($user);

        $session = ExamSession::where('exam_id', $examId)
            ->where('student_id', $student->id)
            ->firstOrFail();

        $this->ensureSessionActive($session);

        $exam = Exam::findOrFail($examId);
        $participant = ExamParticipant::where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->first();

        $packageCode = $participant?->package_code;

        // Ambil butir soal ujian
        $examQuestionsQuery = ExamQuestion::with(['question.options'])
            ->where('exam_id', $exam->id);

        if ($packageCode) {
            $examQuestionsQuery->where(function ($q) use ($packageCode) {
                $q->where('package_code', $packageCode)
                    ->orWhereNull('package_code');
            });
        }

        $examQuestions = $examQuestionsQuery->orderBy('sort_order', 'asc')->get();

        // Ambil jawaban yang telah tersimpan untuk sesi ini
        $savedAnswers = ExamAnswer::where('session_id', $session->id)
            ->get()
            ->keyBy('question_id');

        // Acak urutan butir soal berdasarkan seed sesi jika exam->shuffle_questions true
        $questionItems = $examQuestions->map(function ($eq) {
            return $eq->question;
        })->filter()->values();

        if ($exam->shuffle_questions) {
            $questionItems = $this->shuffleWithSeed($questionItems, $session->seed.'_q');
        }

        $now = Carbon::now();
        $remainingSeconds = max(0, $now->diffInSeconds($session->deadline_at, false));

        // Format butir soal yang aman (STRIP jawaban yang benar)
        $formattedQuestions = [];
        $index = 1;

        foreach ($questionItems as $q) {
            /** @var Question $q */
            $options = $q->options;

            if ($exam->shuffle_options && in_array($q->question_type, ['pg', 'pg_kompleks', 'bs'])) {
                $options = $this->shuffleWithSeed($options, $session->seed.'_opt_'.$q->id);
            }

            // Sanitasi opsi: buang is_correct dan match_key sensitif jika bukan format matching target
            $sanitizedOptions = $options->map(function ($opt) {
                $item = [
                    'id' => $opt->id,
                    'label' => $opt->label,
                    'body' => $opt->body,
                ];

                // Jika soal tipe menjodohkan, biarkan match_key jika dibutuhkan untuk rendering pasangan,
                // tapi JANGAN sertakan is_correct
                return $item;
            })->values()->all();

            $existingAnswer = $savedAnswers->get($q->id);

            $formattedQuestions[] = [
                'number' => $index++,
                'id' => $q->id,
                'question_type' => $q->question_type,
                'body' => $q->body,
                'options' => $sanitizedOptions,
                'user_answer' => $existingAnswer?->answer,
                'is_flagged' => (bool) ($existingAnswer?->is_flagged ?? false),
                'answered_at' => $existingAnswer?->answered_at?->toIso8601String(),
            ];
        }

        return [
            'session_id' => $session->id,
            'exam_id' => $exam->id,
            'title' => $exam->title,
            'status' => $session->status,
            'remaining_seconds' => $remainingSeconds,
            'deadline_at' => $session->deadline_at?->toIso8601String(),
            'total_questions' => count($formattedQuestions),
            'questions' => $formattedQuestions,
        ];
    }

    /**
     * BE-CBT-04: Autosave jawaban siswa per butir soal.
     */
    public function saveAnswer(string $examId, array $data, Request $request): array
    {
        $user = $request->user();
        $student = $this->resolveStudentForUser($user);

        $session = ExamSession::where('exam_id', $examId)
            ->where('student_id', $student->id)
            ->firstOrFail();

        $this->ensureSessionActive($session);

        $questionId = $data['question_id'];

        // SEC-DATA-01: Validasi kepemilikan butir soal terhadap ujian
        $isQuestionInExam = ExamQuestion::where('exam_id', $examId)
            ->where('question_id', $questionId)
            ->exists();

        if (! $isQuestionInExam) {
            throw new HttpException(422, 'Butir soal tidak terdaftar pada paket ujian ini.');
        }

        $answerData = $data['answer'] ?? null;
        $isFlagged = (bool) ($data['is_flagged'] ?? false);

        $now = Carbon::now();

        try {
            $answerRecord = ExamAnswer::updateOrCreate(
                [
                    'session_id' => $session->id,
                    'question_id' => $questionId,
                ],
                [
                    'answer' => $answerData,
                    'is_flagged' => $isFlagged,
                    'answered_at' => $now,
                ]
            );
        } catch (UniqueConstraintViolationException) {
            // Race condition teratasi: baris telah terbuat secara konkuren, lakukan update
            $answerRecord = ExamAnswer::where('session_id', $session->id)
                ->where('question_id', $questionId)
                ->firstOrFail();

            $answerRecord->update([
                'answer' => $answerData,
                'is_flagged' => $isFlagged,
                'answered_at' => $now,
            ]);
        }

        return [
            'question_id' => $answerRecord->question_id,
            'is_saved' => true,
            'is_flagged' => $answerRecord->is_flagged,
            'answered_at' => $answerRecord->answered_at?->toIso8601String(),
            'server_time' => $now->toIso8601String(),
        ];
    }

    /**
     * BE-CBT-04: Catat kejadian pelanggaran anti-cheat (blur, tab switch, minimize).
     */
    public function logViolation(string $examId, array $data, Request $request): array
    {
        $user = $request->user();
        $student = $this->resolveStudentForUser($user);

        $session = ExamSession::where('exam_id', $examId)
            ->where('student_id', $student->id)
            ->firstOrFail();

        if ($session->status === 'selesai') {
            return ['status' => 'already_finished'];
        }

        $now = Carbon::now();

        $violation = ExamViolation::create([
            'session_id' => $session->id,
            'violation_type' => $data['violation_type'],
            'meta' => $data['meta'] ?? [],
            'occurred_at' => $now,
        ]);

        // Cek jumlah pelanggaran total
        $totalViolations = ExamViolation::where('session_id', $session->id)->count();
        $isLocked = false;

        // Toleransi maksimal pelanggaran: 3 kali
        if ($totalViolations >= 3 && $session->status === 'mengerjakan') {
            $session->status = 'terkunci';
            $session->locked_reason = 'Terdeteksi perpindahan layar/aplikasi melebihi toleransi ('.$totalViolations.' kali)';
            $session->save();
            $isLocked = true;
        }

        return [
            'violation_id' => $violation->id,
            'total_violations' => $totalViolations,
            'is_locked' => $isLocked,
            'session_status' => $session->status,
            'locked_reason' => $session->locked_reason,
        ];
    }

    /**
     * BE-CBT-04: Submit akhir / selesaikan ujian oleh siswa.
     */
    public function finishSession(string $examId, Request $request): array
    {
        $user = $request->user();
        $student = $this->resolveStudentForUser($user);

        return DB::transaction(function () use ($examId, $student, $user, $request) {
            $session = ExamSession::where('exam_id', $examId)
                ->where('student_id', $student->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($session->status === 'selesai') {
                return [
                    'session_id' => $session->id,
                    'status' => 'selesai',
                    'message' => 'Ujian sudah diselesaikan sebelumnya.',
                    'submitted_at' => $session->submitted_at?->toIso8601String(),
                ];
            }

            if ($session->status === 'terkunci') {
                throw new HttpException(403, 'Sesi sedang terkunci: '.$session->locked_reason.'. Hubungi pengawas untuk membuka sesi.');
            }

            $now = Carbon::now();
            $session->status = 'selesai';
            $session->submitted_at = $now;
            $session->save();

            $this->logAudit(
                $user->id,
                'exam.finish_session',
                'exam_sessions',
                $session->id,
                ['status' => 'mengerjakan'],
                ['status' => 'selesai', 'submitted_at' => $now->toIso8601String()],
                $request
            );

            $totalAnswers = ExamAnswer::where('session_id', $session->id)
                ->whereNotNull('answer')
                ->count();

            return [
                'session_id' => $session->id,
                'status' => 'selesai',
                'submitted_at' => $now->toIso8601String(),
                'answered_count' => $totalAnswers,
                'message' => 'Ujian berhasil diselesaikan.',
            ];
        });
    }

    /**
     * BE-CBT-04: Pengawas atau admin membuka kunci sesi dan/atau menambah waktu ujian.
     */
    public function unlockOrManageSession(string $sessionId, array $data, Request $request): array
    {
        $session = ExamSession::with(['exam', 'student'])->findOrFail($sessionId);
        $currentUser = $request->user();

        $this->authorizeProctorOrAdminForExam($session->exam_id, $currentUser);

        // SEC-AUTHZ-01: Isolasi ruang untuk aksi proctor
        $isGlobalAdmin = $currentUser && ($currentUser->hasRole(['admin', 'super_admin']) || $currentUser->hasPermission('cbt.exam.manage'));
        if (! $isGlobalAdmin) {
            $assignedRoomIds = ExamRoom::where('exam_id', $session->exam_id)
                ->where('proctor_id', $currentUser->id)
                ->pluck('id')
                ->all();

            $isParticipantInRoom = ExamParticipant::where('exam_id', $session->exam_id)
                ->where('student_id', $session->student_id)
                ->whereIn('exam_room_id', $assignedRoomIds)
                ->exists();

            if (! $isParticipantInRoom) {
                throw new HttpException(403, 'Anda tidak berwenang mengelola peserta di luar ruangan penugasan Anda.');
            }
        }

        $action = $data['action'];
        $reason = $data['reason'] ?? 'Tindakan pengawas ruang';
        $extraMinutes = (int) ($data['extra_minutes'] ?? 0);

        DB::transaction(function () use ($session, $action, $reason, $extraMinutes, $currentUser) {
            if ($action === 'unlock') {
                $session->status = 'mengerjakan';
                $session->locked_reason = null;

                // Jika deadline telah lewat, tambah waktu otomatis minimal sisa atau extra_minutes
                if ($extraMinutes > 0) {
                    $session->extra_minutes += $extraMinutes;
                    $session->deadline_at = ($session->deadline_at && $session->deadline_at->isFuture()
                        ? $session->deadline_at
                        : Carbon::now())->addMinutes($extraMinutes);
                } elseif ($session->deadline_at && $session->deadline_at->isPast()) {
                    // Beri waktu darurat 10 menit jika deadline sudah lewat saat di-unlock
                    $session->extra_minutes += 10;
                    $session->deadline_at = Carbon::now()->addMinutes(10);
                }
                $session->save();
            } elseif ($action === 'extra_time') {
                $session->extra_minutes += $extraMinutes;
                $session->deadline_at = ($session->deadline_at && $session->deadline_at->isFuture()
                    ? $session->deadline_at
                    : Carbon::now())->addMinutes($extraMinutes);
                $session->save();
            } elseif ($action === 'reset') {
                $session->status = 'mengerjakan';
                $session->started_at = Carbon::now();
                $session->deadline_at = Carbon::now()->addMinutes((int) ($session->exam?->duration_min ?? 90));
                $session->submitted_at = null;
                $session->locked_reason = null;
                $session->save();
            } elseif ($action === 'force_submit') {
                $session->status = 'selesai';
                $session->submitted_at = Carbon::now();
                $session->save();
            }

            ExamProctorAction::create([
                'session_id' => $session->id,
                'actor_id' => $currentUser->id,
                'action' => $action,
                'reason' => $reason,
            ]);
        });

        $session->refresh();

        return [
            'session_id' => $session->id,
            'student_name' => $session->student?->full_name,
            'status' => $session->status,
            'action_performed' => $action,
            'extra_minutes' => $session->extra_minutes,
            'deadline_at' => $session->deadline_at?->toIso8601String(),
        ];
    }

    /**
     * Cari profil siswa berdasarkan user yang login.
     */
    protected function resolveStudentForUser(?User $user): Student
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $student = Student::where('user_id', $user->id)->first();

        // Fallback jika login via NIS atau email siswa tanpa user_id relasi langsung
        if (! $student) {
            $student = Student::where('nis', $user->username)->first();
        }

        if (! $student) {
            throw new HttpException(403, 'Akun pengguna ini tidak terdaftar sebagai profil siswa.');
        }

        return $student;
    }

    /**
     * Pastikan sesi ujian masih aktif (belum selesai, belum terkunci, dan belum timeout).
     */
    protected function ensureSessionActive(ExamSession $session): void
    {
        if ($session->status === 'selesai') {
            throw new HttpException(422, 'Sesi ujian telah selesai dan tidak dapat diubah.');
        }

        if ($session->status === 'terkunci') {
            throw new HttpException(403, 'Sesi ujian Anda terkunci: '.($session->locked_reason ?? 'Pelanggaran anti-cheat').'. Hubungi pengawas.');
        }

        $now = Carbon::now();
        if ($session->deadline_at && $now->greaterThan($session->deadline_at)) {
            $session->status = 'selesai';
            $session->submitted_at = $session->deadline_at;
            $session->save();

            throw new HttpException(422, 'Waktu pengerjaan ujian telah berakhir (timeout lock).');
        }
    }

    /**
     * Otorisasi Pengawas Ruang pada Ujian atau Admin.
     */
    protected function authorizeProctorOrAdminForExam(string $examId, ?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Unauthenticated');
        }

        if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
            return;
        }

        if ($user->hasPermission('cbt.exam.manage')) {
            return;
        }

        $isProctor = ExamRoom::where('exam_id', $examId)
            ->where('proctor_id', $user->id)
            ->exists();

        if ($isProctor) {
            return;
        }

        throw new HttpException(403, 'Anda tidak berwenang mengelola sesi ujian ini.');
    }

    /**
     * Fisher-Yates shuffle dengan seed deterministik string.
     */
    protected function shuffleWithSeed($collection, string $seedString)
    {
        $items = $collection->values()->all();
        $count = count($items);
        if ($count <= 1) {
            return collect($items);
        }

        // Hasilkan deret angka integer dari seed hash
        $hash = md5($seedString);
        $seedInt = hexdec(substr($hash, 0, 8));

        // Deterministik pseudorandom generator sederhana
        $rng = function () use (&$seedInt) {
            $seedInt = ($seedInt * 1103515245 + 12345) & 0x7FFFFFFF;

            return $seedInt;
        };

        for ($i = $count - 1; $i > 0; $i--) {
            $j = $rng() % ($i + 1);
            $temp = $items[$i];
            $items[$i] = $items[$j];
            $items[$j] = $temp;
        }

        return collect($items);
    }

    /**
     * BE-CBT-06: Monitoring Live Sesi Ujian Pengawas / Admin.
     * GET /api/v1/exams/{id}/monitor
     */
    public function getLiveMonitoring(string $examId, array $filters, Request $request): array
    {
        $user = $request->user();
        $this->authorizeProctorOrAdminForExam($examId, $user);

        $exam = Exam::withCount('questions')->findOrFail($examId);
        $totalQuestions = $exam->questions_count;

        $participantsQuery = ExamParticipant::with(['student.user', 'examRoom.room', 'examRoom.proctor'])
            ->where('exam_id', $examId);

        // SEC-AUTHZ-01: Isolasi ruangan untuk pengawas non-admin
        $isGlobalAdmin = $user && ($user->hasRole(['admin', 'super_admin']) || $user->hasPermission('cbt.exam.manage'));
        if (! $isGlobalAdmin) {
            $assignedRoomIds = ExamRoom::where('exam_id', $examId)
                ->where('proctor_id', $user->id)
                ->pluck('id')
                ->all();

            if (! empty($filters['room_id'])) {
                if (! in_array($filters['room_id'], $assignedRoomIds)) {
                    throw new HttpException(403, 'Anda tidak berwenang memantau ruangan ujian ini.');
                }
                $participantsQuery->where('exam_room_id', $filters['room_id']);
            } else {
                $participantsQuery->whereIn('exam_room_id', $assignedRoomIds);
            }
        } elseif (! empty($filters['room_id'])) {
            $participantsQuery->where('exam_room_id', $filters['room_id']);
        }

        $allParticipants = $participantsQuery->get();
        $participantStudentIds = $allParticipants->pluck('student_id')->all();

        $sessions = ExamSession::where('exam_id', $examId)
            ->whereIn('student_id', $participantStudentIds)
            ->withCount(['answers' => function ($q) {
                $q->whereNotNull('answer');
            }])
            ->withCount('violations')
            ->get()
            ->keyBy('student_id');

        $notStarted = 0;
        $inProgress = 0;
        $finished = 0;
        $locked = 0;
        $totalViolations = 0;

        $items = [];
        $now = Carbon::now();

        foreach ($allParticipants as $participant) {
            $session = $sessions->get($participant->student_id);
            $sessionStatus = $session ? $session->status : 'belum';

            if (! $session || $sessionStatus === 'belum') {
                $notStarted++;
            } elseif ($sessionStatus === 'mengerjakan') {
                $inProgress++;
            } elseif ($sessionStatus === 'selesai') {
                $finished++;
            } elseif ($sessionStatus === 'terkunci') {
                $locked++;
            }

            $violationCount = $session ? $session->violations_count : 0;
            $totalViolations += $violationCount;

            $remainingSeconds = 0;
            if ($session && $sessionStatus === 'mengerjakan' && $session->deadline_at) {
                $remainingSeconds = max(0, $now->diffInSeconds($session->deadline_at, false));
            }

            $answeredCount = $session ? $session->answers_count : 0;
            $progressPct = $totalQuestions > 0 ? round(($answeredCount / $totalQuestions) * 100, 1) : 0;

            if (! empty($filters['status']) && $sessionStatus !== $filters['status']) {
                continue;
            }

            if (! empty($filters['search'])) {
                $search = strtolower($filters['search']);
                $name = strtolower($participant->student?->full_name ?? '');
                $nis = strtolower($participant->student?->nis ?? '');
                if (! str_contains($name, $search) && ! str_contains($nis, $search)) {
                    continue;
                }
            }

            $items[] = [
                'participant_id' => $participant->id,
                'student_id' => $participant->student_id,
                'student_name' => $participant->student?->full_name,
                'student_nis' => $participant->student?->nis,
                'package_code' => $participant->package_code,
                'room_id' => $participant->exam_room_id,
                'room_name' => $participant->examRoom?->room?->name,
                'proctor_name' => $participant->examRoom?->proctor?->name,
                'session_id' => $session?->id,
                'status' => $sessionStatus,
                'started_at' => $session?->started_at?->toIso8601String(),
                'deadline_at' => $session?->deadline_at?->toIso8601String(),
                'submitted_at' => $session?->submitted_at?->toIso8601String(),
                'extra_minutes' => $session?->extra_minutes ?? 0,
                'remaining_seconds' => $remainingSeconds,
                'answered_questions' => $answeredCount,
                'total_questions' => $totalQuestions,
                'progress_percentage' => $progressPct,
                'violation_count' => $violationCount,
                'last_heartbeat_at' => $session?->last_heartbeat_at?->toIso8601String(),
                'ip_address' => $session?->ip_address,
                'blur_count' => $session?->blur_count ?? 0,
            ];
        }

        return [
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'duration_min' => $exam->duration_min,
            'server_time' => $now->toIso8601String(),
            'summary' => [
                'total_participants' => $allParticipants->count(),
                'not_started_count' => $notStarted,
                'in_progress_count' => $inProgress,
                'finished_count' => $finished,
                'locked_count' => $locked,
                'total_violations' => $totalViolations,
            ],
            'participants' => $items,
        ];
    }

    /**
     * BE-CBT-12: Heartbeat Peserta & Deteksi Anomali Perangkat/IP.
     * POST /api/v1/exam-sessions/{sessionId}/heartbeat
     */
    public function recordHeartbeat(string $sessionId, array $data, Request $request): array
    {
        $session = ExamSession::with(['exam', 'student.user'])->findOrFail($sessionId);

        $user = $request->user();
        if ($user && ! $user->hasRole(['admin', 'super_admin'])) {
            if ($session->student?->user_id !== $user->id) {
                throw new HttpException(403, 'Anda tidak berwenang mengirim heartbeat untuk sesi ini.');
            }
        }

        if ($session->status !== 'mengerjakan') {
            throw new HttpException(422, 'Sesi ujian sedang tidak dalam status aktif pengerjaan.');
        }

        $now = Carbon::now();
        $incomingIp = $request->ip();
        $incomingUa = (string) $request->userAgent();
        $deviceFingerprint = $data['device_fingerprint'] ?? null;
        $screenState = $data['screen_state'] ?? 'fullscreen';
        $activeTab = $data['active_tab'] ?? true;

        $anomaliesDetected = [];

        // 1. Deteksi pergantian alamat IP
        if (! empty($session->ip_address) && $session->ip_address !== $incomingIp) {
            ExamViolation::create([
                'session_id' => $session->id,
                'violation_type' => 'anomaly_ip_change',
                'meta' => [
                    'previous_ip' => $session->ip_address,
                    'new_ip' => $incomingIp,
                    'description' => 'Pergantian alamat IP terdeteksi selama sesi aktif berlangsung',
                ],
                'occurred_at' => $now,
            ]);
            $anomaliesDetected[] = 'anomaly_ip_change';
        }

        // 2. Deteksi pergantian browser / User-Agent
        if (! empty($session->user_agent) && $session->user_agent !== $incomingUa) {
            ExamViolation::create([
                'session_id' => $session->id,
                'violation_type' => 'anomaly_device_change',
                'meta' => [
                    'previous_ua' => $session->user_agent,
                    'new_ua' => $incomingUa,
                    'description' => 'Perubahan User-Agent / peramban terdeteksi',
                ],
                'occurred_at' => $now,
            ]);
            $anomaliesDetected[] = 'anomaly_device_change';
        }

        // 3. Deteksi jeda waktu mencurigakan (gap > 180 detik)
        if ($session->last_heartbeat_at) {
            $gapSeconds = abs((int) $now->diffInSeconds($session->last_heartbeat_at));
            if ($gapSeconds > 180) {
                ExamViolation::create([
                    'session_id' => $session->id,
                    'violation_type' => 'anomaly_suspicious_gap',
                    'meta' => [
                        'gap_seconds' => $gapSeconds,
                        'description' => 'Jeda waktu heartbeat terlalu lama tanpa koneksi aktif',
                    ],
                    'occurred_at' => $now,
                ]);
                $anomaliesDetected[] = 'anomaly_suspicious_gap';
            }
        }

        // 4. Deteksi blur atau perpindahan tab
        if ($screenState === 'blur' || $activeTab === false) {
            $session->blur_count = ($session->blur_count ?? 0) + 1;
            ExamViolation::create([
                'session_id' => $session->id,
                'violation_type' => 'blur',
                'meta' => [
                    'screen_state' => $screenState,
                    'active_tab' => $activeTab,
                    'blur_count' => $session->blur_count,
                ],
                'occurred_at' => $now,
            ]);
            $anomaliesDetected[] = 'blur';
        }

        // Update session tracking
        $session->last_heartbeat_at = $now;
        $session->ip_address = $incomingIp;
        $session->user_agent = substr($incomingUa, 0, 500);
        if ($deviceFingerprint) {
            $session->device_fingerprint = $deviceFingerprint;
        }
        $session->save();

        $remainingSeconds = max(0, $now->diffInSeconds($session->deadline_at, false));

        return [
            'session_id' => $session->id,
            'status' => $session->status,
            'server_time' => $now->toIso8601String(),
            'remaining_seconds' => $remainingSeconds,
            'anomalies_detected' => $anomaliesDetected,
            'blur_count' => $session->blur_count,
        ];
    }

    /**
     * BE-CBT-12: Ambil Daftar Anomali Ujian untuk Ditinjau Pengawas.
     * GET /api/v1/exams/{id}/anomalies
     */
    public function getExamAnomalies(string $examId, array $filters, Request $request): array
    {
        $user = $request->user();
        $this->authorizeProctorOrAdminForExam($examId, $user);

        $exam = Exam::findOrFail($examId);

        $query = ExamViolation::whereHas('session', function ($q) use ($examId) {
            $q->where('exam_id', $examId);
        })->with(['session.student']);

        // SEC-AUTHZ-01: Isolasi anomali hanya untuk siswa di ruangan yang ditugaskan
        $isGlobalAdmin = $user && ($user->hasRole(['admin', 'super_admin']) || $user->hasPermission('cbt.exam.manage'));
        if (! $isGlobalAdmin) {
            $assignedRoomIds = ExamRoom::where('exam_id', $examId)
                ->where('proctor_id', $user->id)
                ->pluck('id')
                ->all();

            $assignedStudentIds = ExamParticipant::where('exam_id', $examId)
                ->whereIn('exam_room_id', $assignedRoomIds)
                ->pluck('student_id')
                ->all();

            $query->whereHas('session', function ($q) use ($examId, $assignedStudentIds) {
                $q->where('exam_id', $examId)
                    ->whereIn('student_id', $assignedStudentIds);
            });
        }

        if (! empty($filters['type'])) {
            $query->where('violation_type', $filters['type']);
        }

        $allViolations = $query->orderBy('occurred_at', 'desc')->get();

        $ipChangeCount = $allViolations->where('violation_type', 'anomaly_ip_change')->count();
        $deviceChangeCount = $allViolations->where('violation_type', 'anomaly_device_change')->count();
        $gapCount = $allViolations->where('violation_type', 'anomaly_suspicious_gap')->count();
        $blurCount = $allViolations->where('violation_type', 'blur')->count();

        $list = $allViolations->map(function ($v) {
            return [
                'id' => $v->id,
                'session_id' => $v->session_id,
                'student_id' => $v->session?->student_id,
                'student_name' => $v->session?->student?->full_name,
                'student_nis' => $v->session?->student?->nis,
                'violation_type' => $v->violation_type,
                'meta' => $v->meta,
                'occurred_at' => $v->occurred_at?->toIso8601String() ?? $v->created_at?->toIso8601String(),
            ];
        });

        return [
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'summary' => [
                'total_anomalies' => $allViolations->count(),
                'ip_changes' => $ipChangeCount,
                'device_changes' => $deviceChangeCount,
                'suspicious_gaps' => $gapCount,
                'blur_events' => $blurCount,
            ],
            'anomalies' => $list,
        ];
    }

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
