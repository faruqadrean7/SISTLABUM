<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\File;
use App\Models\Guardian;
use App\Models\Journal;
use App\Models\LeaveRequest;
use App\Models\Notification;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AcademicAttendanceService
{
    /**
     * BE-ACD-03: Batch record attendance for a class journal session.
     */
    public function recordSessionAttendance(array $data, Request $request): array
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        $isAdmin = $currentUser->hasRole('super_admin')
            || $currentUser->hasPermission('academic.schedule.manage');

        $journal = Journal::with(['schedule.class'])->findOrFail($data['journal_id']);

        // Otorisasi: Hanya guru penugas jadwal atau admin
        if (! $isAdmin && (! $teacher || $teacher->id !== $journal->teacher_id)) {
            throw new HttpException(403, 'Hanya guru penugas jurnal ini yang dapat menginput presensi sesi kelas.');
        }

        $sessionDate = Carbon::parse($journal->session_date)->format('Y-m-d');

        return DB::transaction(function () use ($journal, $data, $sessionDate, $currentUser, $request) {
            $savedRecords = [];

            foreach ($data['attendances'] as $item) {
                $studentId = $item['student_id'];
                $status = $item['status'];
                $note = $item['note'] ?? null;

                // Cek apakah siswa memiliki izin/sakit yang sudah disetujui walas pada tanggal sesi ini
                $approvedLeave = LeaveRequest::where('student_id', $studentId)
                    ->where('status', 'disetujui')
                    ->whereDate('start_date', '<=', $sessionDate)
                    ->whereDate('end_date', '>=', $sessionDate)
                    ->first();

                if ($approvedLeave) {
                    $leaveStatus = match ($approvedLeave->leave_type) {
                        'sakit' => 'sakit',
                        'dispen' => 'izin',
                        default => 'izin',
                    };
                    $status = $leaveStatus;
                    $note = $note ? "{$note} (Disetujui dari permohonan {$approvedLeave->leave_type})" : "Disetujui dari permohonan {$approvedLeave->leave_type}";
                }

                $record = Attendance::updateOrCreate(
                    [
                        'journal_id' => $journal->id,
                        'student_id' => $studentId,
                    ],
                    [
                        'att_date' => $sessionDate,
                        'status' => $status,
                        'source' => 'kelas',
                        'note' => $note,
                        'recorded_by' => $currentUser->id,
                    ]
                );

                $savedRecords[] = $record;
            }

            $this->logAudit(
                $currentUser->id,
                'attendance.session_recorded',
                'Journal',
                $journal->id,
                null,
                ['count' => count($savedRecords)],
                $request
            );

            return [
                'journal_id' => $journal->id,
                'session_date' => $sessionDate,
                'total_recorded' => count($savedRecords),
                'attendances' => $savedRecords,
            ];
        });
    }

    /**
     * BE-ACD-03: Record daily gate attendance (RFID/Barcode/Manual).
     */
    public function recordDailyAttendance(array $data, Request $request): Attendance
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        return DB::transaction(function () use ($data, $currentUser, $request) {
            $record = Attendance::updateOrCreate(
                [
                    'student_id' => $data['student_id'],
                    'att_date' => $data['att_date'],
                    'source' => 'gerbang',
                ],
                [
                    'status' => $data['status'],
                    'note' => $data['note'] ?? null,
                    'recorded_by' => $currentUser->id,
                ]
            );

            $this->logAudit(
                $currentUser->id,
                'attendance.gate_recorded',
                'Attendance',
                $record->id,
                null,
                $record->toArray(),
                $request
            );

            return $record;
        });
    }

    /**
     * BE-ACD-03: Submit leave request (Wali murid mengajukan izin/sakit anak).
     */
    public function createLeaveRequest(array $data, Request $request): LeaveRequest
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        $studentUser = Student::where('user_id', $currentUser->id)->first();
        $isAdmin = $currentUser->hasRole('super_admin')
            || $currentUser->hasPermission('academic.schedule.manage')
            || $currentUser->roles()->where('code', 'like', 'admin%')->exists();

        // IDOR Check:
        if (! $isAdmin) {
            if ($guardian) {
                $isOwnChild = $guardian->students()->where('students.id', $data['student_id'])->exists();
                if (! $isOwnChild) {
                    throw new HttpException(403, 'Anda tidak memiliki hak akses untuk mengajukan izin atas nama siswa ini.');
                }
            } elseif ($studentUser) {
                if ($studentUser->id !== $data['student_id']) {
                    throw new HttpException(403, 'Anda hanya dapat mengajukan permohonan izin untuk diri Anda sendiri.');
                }
            } else {
                throw new HttpException(403, 'Hanya wali murid atau siswa bersangkutan yang berhak mengajukan permohonan izin.');
            }
        }

        $attachmentFileId = $data['attachment_file_id'] ?? null;

        // Dukungan unggah berkas surat izin/dokter langsung
        if ($request->hasFile('attachment_file')) {
            $uploaded = $request->file('attachment_file');
            $storagePath = $uploaded->store("leave-attachments/{$data['student_id']}", 'local');
            $checksum = hash_file('sha256', $uploaded->getRealPath());

            $fileRecord = File::create([
                'owner_id' => $data['student_id'],
                'owner_type' => 'Student',
                'bucket' => 'leave-attachments',
                'object_key' => $storagePath,
                'mime_type' => $uploaded->getMimeType() ?: 'application/octet-stream',
                'size_bytes' => $uploaded->getSize(),
                'visibility' => 'privat',
                'checksum' => $checksum,
            ]);

            $attachmentFileId = $fileRecord->id;
        }

        return DB::transaction(function () use ($data, $attachmentFileId, $currentUser, $request) {
            $leave = LeaveRequest::create([
                'student_id' => $data['student_id'],
                'requested_by' => $currentUser->id,
                'leave_type' => $data['leave_type'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'reason' => trim($data['reason']),
                'attachment_file_id' => $attachmentFileId,
                'status' => 'menunggu',
            ]);

            $this->logAudit(
                $currentUser->id,
                'leave_request.created',
                'LeaveRequest',
                $leave->id,
                null,
                $leave->toArray(),
                $request
            );

            return $leave->load(['student', 'attachmentFile']);
        });
    }

    /**
     * BE-ACD-04: Get leave request detail.
     */
    public function getLeaveRequestDetail(string $id, Request $request): LeaveRequest
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        $studentUser = Student::where('user_id', $currentUser->id)->first();
        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        $isAdmin = $currentUser->hasRole('super_admin')
            || $currentUser->hasPermission('academic.schedule.manage')
            || $currentUser->roles()->where('code', 'like', 'admin%')->exists();

        $leave = LeaveRequest::with(['student.classes', 'attachmentFile', 'requester', 'decisionMaker'])->findOrFail($id);

        if (! $isAdmin) {
            if ($guardian) {
                if (! $guardian->students()->where('students.id', $leave->student_id)->exists()) {
                    throw new HttpException(403, 'Anda tidak memiliki hak akses untuk melihat permohonan izin ini.');
                }
            } elseif ($studentUser) {
                if ($studentUser->id !== $leave->student_id) {
                    throw new HttpException(403, 'Anda tidak memiliki hak akses untuk melihat permohonan izin ini.');
                }
            } elseif ($teacher) {
                $isWalas = SchoolClass::where('homeroom_teacher_id', $teacher->id)
                    ->whereHas('students', fn ($q) => $q->where('students.id', $leave->student_id))
                    ->exists();
                if (! $isWalas) {
                    throw new HttpException(403, 'Anda bukan wali kelas dari siswa bersangkutan.');
                }
            } else {
                throw new HttpException(403, 'Anda tidak memiliki hak akses.');
            }
        }

        return $leave;
    }

    /**
     * BE-ACD-04: Decide leave request status (Wali kelas / Admin menyetujui atau menolak).
     */
    public function decideLeaveRequest(string $id, array $data, Request $request): LeaveRequest
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        $isAdmin = $currentUser->hasRole('super_admin')
            || $currentUser->hasPermission('academic.schedule.manage')
            || $currentUser->roles()->where('code', 'like', 'admin%')->exists();

        $leave = LeaveRequest::with(['student.classes'])->findOrFail($id);

        // Otorisasi walas: pastikan guru adalah wali kelas dari kelas aktif siswa tersebut
        if (! $isAdmin) {
            if (! $teacher) {
                throw new HttpException(403, 'Hanya wali kelas atau admin yang berhak memutuskan izin siswa.');
            }

            $isWalas = SchoolClass::where('homeroom_teacher_id', $teacher->id)
                ->whereHas('students', fn ($q) => $q->where('students.id', $leave->student_id))
                ->exists();

            if (! $isWalas) {
                throw new HttpException(403, 'Hanya wali kelas dari siswa bersangkutan yang berhak memutuskan izin.');
            }
        }

        return DB::transaction(function () use ($leave, $data, $currentUser, $request) {
            $oldData = $leave->toArray();
            $decisionNotes = $data['decision_notes'] ?? ($data['note'] ?? null);

            $leave->update([
                'status' => $data['status'],
                'decided_by' => $currentUser->id,
                'decision_notes' => $decisionNotes,
            ]);

            // Jika disetujui, sinkronisasikan entri presensi harian pada rentang tanggal izin
            if ($data['status'] === 'disetujui') {
                $startDate = Carbon::parse($leave->start_date);
                $endDate = Carbon::parse($leave->end_date);
                $attStatus = match ($leave->leave_type) {
                    'sakit' => 'sakit',
                    'dispen' => 'izin',
                    default => 'izin',
                };

                for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                    Attendance::updateOrCreate(
                        [
                            'student_id' => $leave->student_id,
                            'att_date' => $date->format('Y-m-d'),
                            'source' => 'gerbang',
                        ],
                        [
                            'status' => $attStatus,
                            'note' => "Pengajuan {$leave->leave_type} disetujui: {$leave->reason}".($decisionNotes ? " (Catatan Walas: {$decisionNotes})" : ''),
                            'recorded_by' => $currentUser->id,
                        ]
                    );
                }
            }

            // Memicu notifikasi instan ke pemohon jika requested_by tersedia
            if (! empty($leave->requested_by)) {
                $statusText = $data['status'] === 'disetujui' ? 'disetujui' : 'ditolak';
                $notesText = $decisionNotes ? " Catatan: {$decisionNotes}" : '';
                Notification::create([
                    'user_id' => $leave->requested_by,
                    'notif_type' => 'leave_request.decision',
                    'title' => "Permohonan Izin {$leave->student?->full_name} Telah {$statusText}",
                    'body' => "Permohonan izin ({$leave->leave_type}) untuk tanggal {$leave->start_date->format('d/m/Y')} s.d. {$leave->end_date->format('d/m/Y')} telah {$statusText} oleh wali kelas.{$notesText}",
                    'data' => [
                        'leave_request_id' => $leave->id,
                        'student_id' => $leave->student_id,
                        'status' => $leave->status,
                        'decision_notes' => $decisionNotes,
                    ],
                ]);
            }

            $this->logAudit(
                $currentUser->id,
                'leave_request.decided',
                'LeaveRequest',
                $leave->id,
                $oldData,
                $leave->toArray(),
                $request
            );

            return $leave->fresh(['student', 'decisionMaker', 'attachmentFile']);
        });
    }

    /**
     * Alias for backward-compatibility with updateLeaveRequestStatus.
     */
    public function updateLeaveRequestStatus(string $id, array $data, Request $request): LeaveRequest
    {
        return $this->decideLeaveRequest($id, $data, $request);
    }

    /**
     * BE-ACD-03: List leave requests with scoping.
     */
    public function listLeaveRequests(array $filters, Request $request): LengthAwarePaginator
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        $isAdmin = $currentUser->hasRole('super_admin')
            || $currentUser->hasPermission('academic.schedule.manage')
            || $currentUser->roles()->where('code', 'like', 'admin%')->exists();

        $query = LeaveRequest::with(['student', 'attachmentFile', 'decisionMaker']);

        // Scoping
        if (! $isAdmin) {
            if ($guardian) {
                $childIds = $guardian->students()->pluck('students.id');
                $query->whereIn('student_id', $childIds);
            } elseif ($teacher) {
                // Guru melihat izin kelas perwaliannya
                $homeroomClassIds = SchoolClass::where('homeroom_teacher_id', $teacher->id)->pluck('id');
                $query->whereHas('student.classes', fn ($q) => $q->whereIn('classes.id', $homeroomClassIds));
            }
        }

        if (! empty($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 20), 100);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * BE-ACD-03: List attendance records with filters & scoping.
     */
    public function listAttendances(array $filters, Request $request): LengthAwarePaginator
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        $isAdmin = $currentUser->hasRole('super_admin')
            || $currentUser->hasPermission('academic.attendance.read')
            || $currentUser->hasPermission('academic.attendance.write');

        $query = Attendance::with(['student', 'journal.schedule.subject', 'journal.schedule.class', 'recorder']);

        // Data scoping: Jika wali murid, batasi hanya anak perwaliannya
        if ($guardian && ! $currentUser->hasRole('super_admin') && ! $currentUser->hasPermission('academic.schedule.manage')) {
            $childIds = $guardian->students()->pluck('students.id');
            $query->whereIn('student_id', $childIds);
        }

        if (! empty($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }
        if (! empty($filters['journal_id'])) {
            $query->where('journal_id', $filters['journal_id']);
        }
        if (! empty($filters['class_id'])) {
            $classId = $filters['class_id'];
            $query->whereHas('student.classes', fn ($q) => $q->where('classes.id', $classId));
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['source'])) {
            $query->where('source', $filters['source']);
        }
        if (! empty($filters['start_date'])) {
            $query->whereDate('att_date', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('att_date', '<=', $filters['end_date']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 20), 100);

        return $query->orderBy('att_date', 'desc')->paginate($perPage);
    }

    /**
     * BE-ACD-03: Attendance recap statistics (by student or class).
     */
    public function getAttendanceRecap(array $filters, Request $request): array
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        $isAdmin = $currentUser->hasRole('super_admin')
            || $currentUser->hasPermission('academic.attendance.read')
            || $currentUser->hasPermission('academic.attendance.write');

        $query = Attendance::query();

        if ($guardian && ! $currentUser->hasRole('super_admin') && ! $currentUser->hasPermission('academic.schedule.manage')) {
            $childIds = $guardian->students()->pluck('students.id');
            $query->whereIn('student_id', $childIds);
        }

        if (! empty($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }
        if (! empty($filters['class_id'])) {
            $classId = $filters['class_id'];
            $query->whereHas('student.classes', fn ($q) => $q->where('classes.id', $classId));
        }
        if (! empty($filters['start_date'])) {
            $query->whereDate('att_date', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('att_date', '<=', $filters['end_date']);
        }

        $total = (clone $query)->count();
        $hadir = (clone $query)->where('status', 'hadir')->count();
        $izin = (clone $query)->where('status', 'izin')->count();
        $sakit = (clone $query)->where('status', 'sakit')->count();
        $alpa = (clone $query)->where('status', 'alpa')->count();
        $terlambat = (clone $query)->where('status', 'terlambat')->count();

        $percentage = $total > 0 ? round((($hadir + $terlambat) / $total) * 100, 2) : 100.0;

        return [
            'total_sessions' => $total,
            'summary' => [
                'hadir' => $hadir,
                'izin' => $izin,
                'sakit' => $sakit,
                'alpa' => $alpa,
                'terlambat' => $terlambat,
            ],
            'attendance_rate' => $percentage,
            'filters' => $filters,
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
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
