<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\CharacterNote;
use App\Models\ClassStudent;
use App\Models\ExtracurricularMember;
use App\Models\Grade;
use App\Models\Guardian;
use App\Models\ReportCard;
use App\Models\ReportDescriptionTemplate;
use App\Models\SchoolClass;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ReportCardService
{
    /**
     * BE-GRD-04: Daftar template deskripsi capaian rapor.
     */
    public function listTemplates(array $filters): LengthAwarePaginator
    {
        $query = ReportDescriptionTemplate::with('subject')
            ->orderBy('created_at', 'desc');

        if (! empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (! empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * BE-GRD-04: Simpan atau perbarui template deskripsi capaian.
     */
    public function storeTemplate(array $data, Request $request): ReportDescriptionTemplate
    {
        $template = ReportDescriptionTemplate::updateOrCreate(
            [
                'subject_id' => $data['subject_id'],
                'level' => $data['level'],
            ],
            [
                'template_text' => $data['template_text'],
            ]
        );

        $this->logAudit(
            $request->user()?->id,
            'report_template.save',
            'report_description_templates',
            $template->id,
            null,
            $data,
            $request
        );

        return $template->fresh('subject');
    }

    /**
     * BE-GRD-04: Hapus template deskripsi capaian.
     */
    public function deleteTemplate(string $id, Request $request): void
    {
        $template = ReportDescriptionTemplate::findOrFail($id);
        $template->delete();

        $this->logAudit(
            $request->user()?->id,
            'report_template.delete',
            'report_description_templates',
            $id,
            ['subject_id' => $template->subject_id, 'level' => $template->level],
            null,
            $request
        );
    }

    /**
     * BE-GRD-04: Generate E-Rapor semesteran per siswa atau rombel.
     */
    public function generateReportCards(array $data, Request $request): array
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        if (! $this->canGenerate($currentUser)) {
            throw new HttpException(403, 'Anda tidak memiliki hak akses untuk men-generate e-rapor semester.');
        }

        $semester = Semester::with('academicYear')->findOrFail($data['semester_id']);

        $students = collect();
        if (! empty($data['student_id'])) {
            $student = Student::with('classes')->findOrFail($data['student_id']);
            $students->push($student);
        } elseif (! empty($data['class_id'])) {
            $studentIds = ClassStudent::where('class_id', $data['class_id'])
                ->whereNull('left_at')
                ->pluck('student_id');

            $students = Student::with('classes')
                ->whereIn('id', $studentIds)
                ->get();
        }

        if ($students->isEmpty()) {
            throw new HttpException(422, 'Tidak ada siswa yang ditemukan untuk diproses.');
        }

        $statusToSet = $data['status'] ?? 'draft';
        $results = [];

        DB::transaction(function () use ($students, $semester, $statusToSet, $data, &$results, $request, $currentUser) {
            foreach ($students as $student) {
                $existingReport = ReportCard::where('student_id', $student->id)
                    ->where('semester_id', $semester->id)
                    ->first();

                if ($existingReport && in_array($existingReport->status, ['terkunci', 'disetujui', 'terbit'])) {
                    if ($students->count() === 1) {
                        throw new HttpException(422, "E-Rapor semester siswa {$student->full_name} sedang terkunci atau telah disahkan dan tidak dapat diperbarui secara langsung.");
                    }
                    $results[] = $existingReport;

                    continue;
                }

                $snapshot = $this->compileSemesterSnapshot($student, $semester, $data['homeroom_note'] ?? null);

                $report = $existingReport ?? new ReportCard;
                $isNew = ! $report->exists;

                $report->student_id = $student->id;
                $report->semester_id = $semester->id;
                $report->data_snapshot = $snapshot;
                $report->status = $statusToSet;

                if (! $report->verify_token) {
                    $report->verify_token = hash('sha256', Str::uuid()->toString().microtime(true));
                }

                $report->save();

                $this->logAudit(
                    $currentUser->id,
                    $isNew ? 'report_card.create' : 'report_card.regenerate',
                    'report_cards',
                    $report->id,
                    $isNew ? null : ['status' => $existingReport->status],
                    ['status' => $report->status, 'student_id' => $student->id, 'semester_id' => $semester->id],
                    $request
                );

                $results[] = $report->fresh(['student', 'semester.academicYear', 'approver']);
            }
        });

        return $results;
    }

    /**
     * BE-GRD-04: Kompilasi data snapshot semesteran resmi.
     */
    public function compileSemesterSnapshot(Student $student, Semester $semester, ?string $manualNote = null): array
    {
        $activeClass = $student->classes()
            ->whereNull('class_students.left_at')
            ->first();

        // 1. Identitas Siswa & Rombel
        $studentData = [
            'id' => $student->id,
            'nis' => $student->nis,
            'nisn' => $student->nisn,
            'full_name' => $student->full_name,
            'gender' => $student->gender,
            'class_id' => $activeClass?->id,
            'class_name' => $activeClass?->name ?? 'Belum ada kelas',
        ];

        // 2. Metadata Semester & Tahun Ajaran
        $semesterData = [
            'id' => $semester->id,
            'name' => $semester->name,
            'academic_year' => $semester->academicYear?->name ?? '2026/2027',
            'start_date' => $semester->start_date?->toDateString(),
            'end_date' => $semester->end_date?->toDateString(),
        ];

        // 3. Nilai Akhir & Deskripsi Capaian per Mapel
        $grades = Grade::with(['component.subject'])
            ->where('student_id', $student->id)
            ->where(function ($q) use ($semester) {
                $q->whereHas('period', fn ($p) => $p->where('semester_id', $semester->id))
                    ->orWhereHas('component', fn ($c) => $c->where('semester_id', $semester->id));
            })
            ->get();

        $groupedGrades = $grades->groupBy(fn ($g) => $g->component?->subject_id ?? 'no_subject');
        $subjectsSummary = [];

        foreach ($groupedGrades as $subjectId => $subjGrades) {
            $first = $subjGrades->first();
            $subject = $first->component?->subject;
            if (! $subject) {
                continue;
            }

            $totalWeighted = 0;
            $totalWeight = 0;

            foreach ($subjGrades as $gradeItem) {
                $weight = (float) ($gradeItem->component?->weight ?? 1.0);
                $val = (float) $gradeItem->value;
                $totalWeighted += ($val * $weight);
                $totalWeight += $weight;
            }

            $finalScore = $totalWeight > 0
                ? round($totalWeighted / $totalWeight, 2)
                : round($subjGrades->avg('value'), 2);

            // Ambang KKTP default = 75.0
            $level = $finalScore >= 75.0 ? 'tuntas' : 'belum';

            // Ambil template deskripsi capaian
            $template = ReportDescriptionTemplate::where('subject_id', $subject->id)
                ->where('level', $level)
                ->first();

            $descriptionText = $template?->template_text;
            if (! $descriptionText) {
                $descriptionText = $level === 'tuntas'
                    ? "Menunjukkan penguasaan capaian pembelajaran yang sangat baik pada mata pelajaran {$subject->name}."
                    : "Perlu bimbingan dan pendampingan lebih lanjut dalam mencapai ketuntasan tujuan pembelajaran {$subject->name}.";
            }

            $subjectsSummary[] = [
                'subject_id' => $subject->id,
                'subject_code' => $subject->code,
                'subject_name' => $subject->name,
                'subject_group' => $subject->subject_group ?? 'Kelompok A',
                'final_score' => $finalScore,
                'level' => $level,
                'competency_description' => $descriptionText,
            ];
        }

        // 4. Rekap Absensi Semester
        $attQuery = Attendance::where('student_id', $student->id);
        if ($semester->start_date && $semester->end_date) {
            $attQuery->whereBetween('att_date', [$semester->start_date, $semester->end_date]);
        }
        $attendances = $attQuery->get();

        $hadir = $attendances->where('status', 'hadir')->count();
        $sakit = $attendances->where('status', 'sakit')->count();
        $izin = $attendances->where('status', 'izin')->count();
        $alpa = $attendances->where('status', 'alpa')->count();
        $totalDays = $hadir + $sakit + $izin + $alpa;

        $attendanceSnapshot = [
            'hadir' => $hadir,
            'sakit' => $sakit,
            'izin' => $izin,
            'alpa' => $alpa,
            'total_recorded' => $totalDays,
            'percentage' => $totalDays > 0 ? round(($hadir / $totalDays) * 100, 2) : 100.0,
        ];

        // 5. Ekstrakurikuler Siswa
        $extracurriculars = ExtracurricularMember::with('extracurricular')
            ->where('student_id', $student->id)
            ->get()
            ->map(fn ($em) => [
                'name' => $em->extracurricular?->name ?? 'Ekstrakurikuler',
                'predicate' => $em->final_grade ?? 'A',
                'status' => $em->status ?? 'aktif',
                'description' => 'Aktif berpartisipasi dalam kegiatan ekstrakurikuler.',
            ])
            ->values()
            ->all();

        // 6. Catatan Wali Kelas
        $latestCharNote = CharacterNote::where('student_id', $student->id)
            ->whereHas('period', fn ($p) => $p->where('semester_id', $semester->id))
            ->orderBy('created_at', 'desc')
            ->first();

        $homeroomNote = $manualNote ?: ($latestCharNote?->homeroom_note ?: 'Tingkatkan terus prestasi belajar dan pertahankan akhlak mulia.');

        return [
            'school_name' => 'Portal Sekolah Satu Pintu SISTLABUM',
            'student' => $studentData,
            'semester' => $semesterData,
            'subjects' => $subjectsSummary,
            'attendance' => $attendanceSnapshot,
            'extracurriculars' => $extracurriculars,
            'homeroom_note' => $homeroomNote,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * BE-GRD-04: Daftar E-Rapor semester dengan filter & otorisasi IDOR.
     */
    public function listReportCards(array $filters, Request $request): LengthAwarePaginator
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $student = Student::where('user_id', $currentUser->id)->first();
        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        $isAdmin = $this->checkIsAdmin($currentUser);

        $query = ReportCard::with(['student.classes', 'semester.academicYear', 'approver'])
            ->orderBy('created_at', 'desc');

        if (! $isAdmin) {
            if ($student) {
                $query->where('student_id', $student->id)
                    ->whereIn('status', ['disetujui', 'terbit']);
            } elseif ($guardian) {
                $childIds = $guardian->students()->pluck('students.id');
                $query->whereIn('student_id', $childIds)
                    ->whereIn('status', ['disetujui', 'terbit']);
            } elseif ($teacher) {
                $homeroomClassIds = SchoolClass::where('homeroom_teacher_id', $teacher->id)->pluck('id');
                $query->whereHas('student.classes', fn ($q) => $q->whereIn('classes.id', $homeroomClassIds));
            } else {
                throw new HttpException(403, 'Akses ditolak.');
            }
        }

        if (! empty($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        if (! empty($filters['semester_id'])) {
            $query->where('semester_id', $filters['semester_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['class_id'])) {
            $classId = $filters['class_id'];
            $query->whereHas('student.classes', fn ($q) => $q->where('classes.id', $classId));
        }

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * BE-GRD-04: Detail E-Rapor semester dengan otorisasi IDOR.
     */
    public function getReportCard(string $id, Request $request): ReportCard
    {
        $report = ReportCard::with(['student.classes', 'semester.academicYear', 'approver'])->findOrFail($id);
        $this->authorizeAccess($report, $request);

        return $report;
    }

    /**
     * BE-GRD-04: Kunci / buka kunci E-Rapor semester oleh Admin Kurikulum.
     */
    public function lockReportCard(string $id, array $data, Request $request): ReportCard
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        if (! $this->checkIsAdmin($currentUser)) {
            throw new HttpException(403, 'Hanya Administrator atau Admin Kurikulum yang berwenang mengunci e-rapor.');
        }

        $report = ReportCard::findOrFail($id);
        $oldStatus = $report->status;
        $isLocked = (bool) $data['is_locked'];

        if ($isLocked) {
            $report->status = 'terkunci';
            $report->locked_at = now();
        } else {
            $report->status = 'draft';
            $report->locked_at = null;
        }

        $report->save();

        $this->logAudit(
            $currentUser->id,
            $isLocked ? 'report_card.lock' : 'report_card.unlock',
            'report_cards',
            $report->id,
            ['status' => $oldStatus],
            ['status' => $report->status, 'locked_at' => $report->locked_at, 'reason' => $data['reason'] ?? null],
            $request
        );

        return $report->fresh(['student', 'semester.academicYear', 'approver']);
    }

    /**
     * BE-GRD-04: Pengesahan Kepala Sekolah atas E-Rapor semester.
     */
    public function approveReportCard(string $id, array $data, Request $request): ReportCard
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        if (! $this->canApprove($currentUser)) {
            throw new HttpException(403, 'Hanya Kepala Sekolah atau Administrator yang berwenang mengesahkan e-rapor.');
        }

        $report = ReportCard::findOrFail($id);
        $oldStatus = $report->status;
        $newStatus = $data['status'];

        $report->status = $newStatus;
        if (in_array($newStatus, ['disetujui', 'terbit'])) {
            $report->approved_by = $currentUser->id;
        } else {
            $report->approved_by = null;
        }

        $report->save();

        $this->logAudit(
            $currentUser->id,
            'report_card.approve',
            'report_cards',
            $report->id,
            ['status' => $oldStatus],
            ['status' => $newStatus, 'approved_by' => $report->approved_by, 'note' => $data['note'] ?? null],
            $request
        );

        return $report->fresh(['student', 'semester.academicYear', 'approver']);
    }

    /**
     * BE-GRD-04: Unduh PDF E-Rapor semester resmi bertanda tangan QR.
     */
    public function downloadPdf(string $id, Request $request): Response
    {
        $report = ReportCard::with(['student.classes', 'semester.academicYear', 'approver'])->findOrFail($id);
        $this->authorizeAccess($report, $request);

        $pdfBinary = $this->buildPdfContent($report);

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="rapor_semester_'.$report->verify_token.'.pdf"',
            'Cache-Control' => 'no-cache, private',
        ]);
    }

    /**
     * Buat konten PDF resmi E-Rapor Semester %PDF-1.4.
     */
    protected function buildPdfContent(ReportCard $report): string
    {
        $snapshot = $report->data_snapshot ?? [];
        $student = $snapshot['student'] ?? [];
        $sem = $snapshot['semester'] ?? [];
        $subjects = $snapshot['subjects'] ?? [];
        $att = $snapshot['attendance'] ?? [];
        $ekskul = $snapshot['extracurriculars'] ?? [];
        $homeroomNote = $snapshot['homeroom_note'] ?? '-';

        $verifyUrl = url('/api/v1/public/verify/'.$report->verify_token);

        $lines = [
            'PORTAL SEKOLAH SATU PINTU SISTLABUM',
            '========================================================================',
            'LAPORAN HASIL BELAJAR (E-RAPOR SEMESTER)',
            '',
            'Nama Siswa    : '.($student['full_name'] ?? '-'),
            'NIS / NISN    : '.($student['nis'] ?? '-').' / '.($student['nisn'] ?? '-'),
            'Kelas         : '.($student['class_name'] ?? '-'),
            'Semester      : '.($sem['name'] ?? '-').' ('.($sem['academic_year'] ?? '-').')',
            '========================================================================',
            'CAPAIAN KOMPETENSI MATA PELAJARAN:',
        ];

        foreach ($subjects as $s) {
            $lines[] = sprintf(' - [%s] %-25s : Nilai %s (%s)',
                $s['subject_code'] ?? 'MAPEL',
                substr($s['subject_name'] ?? 'Mapel', 0, 25),
                $s['final_score'] ?? 0,
                strtoupper($s['level'] ?? 'tuntas')
            );
            $lines[] = '   Deskripsi: '.substr($s['competency_description'] ?? '-', 0, 75);
        }

        $lines[] = '------------------------------------------------------------------------';
        $lines[] = sprintf('KETIDAKHADIRAN: Sakit: %d hari | Izin: %d hari | Tanpa Keterangan: %d hari',
            $att['sakit'] ?? 0,
            $att['izin'] ?? 0,
            $att['alpa'] ?? 0
        );

        if (! empty($ekskul)) {
            $lines[] = 'EKSTRAKURIKULER:';
            foreach ($ekskul as $e) {
                $lines[] = sprintf(' - %s: Predikat %s', $e['name'], $e['predicate'] ?? 'A');
            }
        }

        $lines[] = 'CATATAN WALI KELAS: '.substr($homeroomNote, 0, 80);
        $lines[] = '========================================================================';
        $lines[] = 'STATUS DOKUMEN    : '.strtoupper($report->status);
        $lines[] = 'KEPALA SEKOLAH    : '.($report->approver?->username ?? 'Kepala Sekolah');
        $lines[] = 'TOKEN VERIFIKASI  : '.$report->verify_token;
        $lines[] = 'URL VERIFIKASI QR : '.$verifyUrl;
        $lines[] = '========================================================================';

        $textStream = "BT\n/F1 9 Tf\n50 790 Td\n13 TL\n";
        foreach ($lines as $line) {
            $sanitized = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $line);
            $textStream .= "({$sanitized}) '\n";
        }
        $textStream .= "ET\n";

        $streamLen = strlen($textStream);

        $objects = [];
        $objects[] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $objects[] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $objects[] = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
        $objects[] = "4 0 obj\n<< /Length ".$streamLen." >>\nstream\n".$textStream."endstream\nendobj\n";
        $objects[] = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n";

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $obj) {
            $offsets[] = strlen($pdf);
            $pdf .= $obj;
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\n";
        $pdf .= "startxref\n".$xrefOffset."\n%%EOF\n";

        return $pdf;
    }

    /**
     * Otorisasi IDOR akses rapor semester.
     */
    protected function authorizeAccess(ReportCard $report, Request $request): void
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        if ($this->checkIsAdmin($currentUser)) {
            return;
        }

        $student = Student::where('user_id', $currentUser->id)->first();
        if ($student) {
            if ($report->student_id !== $student->id || ! in_array($report->status, ['disetujui', 'terbit'])) {
                throw new HttpException(403, 'Akses ditolak.');
            }

            return;
        }

        $guardian = Guardian::where('user_id', $currentUser->id)->first();
        if ($guardian) {
            $childIds = $guardian->students()->pluck('students.id')->all();
            if (! in_array($report->student_id, $childIds) || ! in_array($report->status, ['disetujui', 'terbit'])) {
                throw new HttpException(403, 'Akses ditolak.');
            }

            return;
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if ($teacher) {
            $homeroomClassIds = SchoolClass::where('homeroom_teacher_id', $teacher->id)->pluck('id');
            $isInClass = $report->student?->classes()->whereIn('classes.id', $homeroomClassIds)->exists();
            if ($isInClass) {
                return;
            }
        }

        throw new HttpException(403, 'Akses ditolak.');
    }

    protected function canGenerate(User $user): bool
    {
        return $this->checkIsAdmin($user)
            || Teacher::where('user_id', $user->id)->exists();
    }

    protected function canApprove(User $user): bool
    {
        return $user->hasRole('principal')
            || $user->hasRole('super_admin')
            || $user->hasPermission('academic.report.generate')
            || $user->roles()->where('code', 'like', 'admin%')->exists();
    }

    protected function checkIsAdmin(User $user): bool
    {
        return $user->hasRole('super_admin')
            || $user->hasRole('principal')
            || $user->hasPermission('academic.report.generate')
            || $user->roles()->where('code', 'like', 'admin%')->exists();
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
