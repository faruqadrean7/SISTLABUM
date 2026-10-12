<?php

namespace Tests\Feature\Academic;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\CharacterNote;
use App\Models\ClassStudent;
use App\Models\Grade;
use App\Models\GradeComponent;
use App\Models\GradeLevel;
use App\Models\GradePeriod;
use App\Models\Guardian;
use App\Models\Permission;
use App\Models\ProgressReport;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProgressReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $principalUser;

    protected User $adminUser;

    protected User $walasUser;

    protected User $student1User;

    protected User $student2User;

    protected User $guardianUser;

    protected Teacher $walas;

    protected Student $student1;

    protected Student $student2;

    protected SchoolClass $classA;

    protected Semester $semester1;

    protected GradePeriod $periodMonth8;

    protected Subject $subjectMath;

    protected GradeComponent $componentTugas;

    protected function setUp(): void
    {
        parent::setUp();

        $rolePrincipal = Role::firstOrCreate(['code' => 'principal'], ['name' => 'Kepala Sekolah', 'is_system' => true]);
        $roleAdmin = Role::firstOrCreate(['code' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $roleTeacher = Role::firstOrCreate(['code' => 'teacher'], ['name' => 'Guru', 'is_system' => true]);
        $roleStudent = Role::firstOrCreate(['code' => 'student'], ['name' => 'Siswa', 'is_system' => true]);
        $roleGuardian = Role::firstOrCreate(['code' => 'guardian'], ['name' => 'Wali Murid', 'is_system' => true]);

        $permReportGen = Permission::firstOrCreate(['code' => 'academic.report.generate'], ['description' => 'Mencetak rapor']);
        $permGradeRead = Permission::firstOrCreate(['code' => 'academic.grade.read'], ['description' => 'Melihat nilai']);
        $permGradeWrite = Permission::firstOrCreate(['code' => 'academic.grade.write'], ['description' => 'Menginput nilai']);

        $rolePrincipal->permissions()->syncWithoutDetaching([$permReportGen->id, $permGradeRead->id]);
        $roleAdmin->permissions()->syncWithoutDetaching([$permReportGen->id, $permGradeRead->id, $permGradeWrite->id]);
        $roleTeacher->permissions()->syncWithoutDetaching([$permGradeRead->id, $permGradeWrite->id]);
        $roleStudent->permissions()->syncWithoutDetaching([$permGradeRead->id]);
        $roleGuardian->permissions()->syncWithoutDetaching([$permGradeRead->id]);

        // Users
        $this->principalUser = User::create([
            'username' => 'kepsek1',
            'email' => 'kepsek@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->principalUser->roles()->attach($rolePrincipal->id);

        $this->adminUser = User::create([
            'username' => 'adminacademic',
            'email' => 'admin@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->attach($roleAdmin->id);

        $this->walasUser = User::create([
            'username' => 'walas1',
            'email' => 'walas@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->walasUser->roles()->attach($roleTeacher->id);

        $this->student1User = User::create([
            'username' => 'student1',
            'email' => 'student1@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->student1User->roles()->attach($roleStudent->id);

        $this->student2User = User::create([
            'username' => 'student2',
            'email' => 'student2@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->student2User->roles()->attach($roleStudent->id);

        $this->guardianUser = User::create([
            'username' => 'guardian1',
            'email' => 'ortu1@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->guardianUser->roles()->attach($roleGuardian->id);

        // Academic Structure
        $ay = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'status' => 'active',
        ]);

        $this->semester1 = Semester::create([
            'academic_year_id' => $ay->id,
            'name' => 'Semester Ganjil 2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2026-12-31',
            'is_active' => true,
        ]);

        $this->periodMonth8 = GradePeriod::create([
            'semester_id' => $this->semester1->id,
            'month' => 8,
            'status' => 'open',
        ]);

        $this->walas = Teacher::create([
            'user_id' => $this->walasUser->id,
            'nip' => '198701012010011001',
            'full_name' => 'Budi Santoso, S.Pd',
            'status' => 'active',
        ]);

        $gradeLevel = GradeLevel::create([
            'name' => 'Kelas 10',
            'level' => 10,
        ]);

        $this->classA = SchoolClass::create([
            'academic_year_id' => $ay->id,
            'grade_level_id' => $gradeLevel->id,
            'homeroom_teacher_id' => $this->walas->id,
            'name' => 'X-IPA-1',
            'capacity' => 36,
        ]);

        $this->student1 = Student::create([
            'user_id' => $this->student1User->id,
            'nis' => '202600001',
            'nisn' => '0098765431',
            'nik_enc' => 'enc_3578010101010001',
            'full_name' => 'Ahmad Fikri Pratama',
            'gender' => 'L',
            'birth_place' => 'Malang',
            'birth_date' => '2010-01-01',
            'entry_date' => '2026-07-01',
            'status' => 'aktif',
        ]);

        $this->student2 = Student::create([
            'user_id' => $this->student2User->id,
            'nis' => '202600002',
            'nisn' => '0098765432',
            'nik_enc' => 'enc_3578010101010002',
            'full_name' => 'Siti Aisyah Putri',
            'gender' => 'P',
            'birth_place' => 'Surabaya',
            'birth_date' => '2010-02-02',
            'entry_date' => '2026-07-01',
            'status' => 'aktif',
        ]);

        ClassStudent::create([
            'class_id' => $this->classA->id,
            'student_id' => $this->student1->id,
            'joined_at' => Carbon::now()->subMonths(2),
        ]);

        ClassStudent::create([
            'class_id' => $this->classA->id,
            'student_id' => $this->student2->id,
            'joined_at' => Carbon::now()->subMonths(2),
        ]);

        // Hubungkan Guardian dengan Student1
        $guardian = Guardian::create([
            'user_id' => $this->guardianUser->id,
            'full_name' => 'Bapak Hartono',
            'phone' => '081234567890',
        ]);
        $guardian->students()->attach($this->student1->id, ['relationship' => 'father', 'is_primary' => true]);

        // Subject & Components
        $this->subjectMath = Subject::create([
            'code' => 'MAT-10',
            'name' => 'Matematika Wajib',
            'subject_group' => 'Kelompok A',
        ]);

        $this->componentTugas = GradeComponent::create([
            'subject_id' => $this->subjectMath->id,
            'semester_id' => $this->semester1->id,
            'class_id' => $this->classA->id,
            'code' => 'TGS-1',
            'name' => 'Tugas Mandiri 1',
            'weight' => 40.00,
        ]);

        $componentUH = GradeComponent::create([
            'subject_id' => $this->subjectMath->id,
            'semester_id' => $this->semester1->id,
            'class_id' => $this->classA->id,
            'code' => 'UH-1',
            'name' => 'Ulangan Harian 1',
            'weight' => 60.00,
        ]);

        // Grades Student 1
        Grade::create([
            'student_id' => $this->student1->id,
            'component_id' => $this->componentTugas->id,
            'period_id' => $this->periodMonth8->id,
            'value' => 80.00,
            'source' => 'manual',
            'entered_by' => $this->walasUser->id,
        ]);

        Grade::create([
            'student_id' => $this->student1->id,
            'component_id' => $componentUH->id,
            'period_id' => $this->periodMonth8->id,
            'value' => 90.00,
            'source' => 'manual',
            'entered_by' => $this->walasUser->id,
        ]);

        // Attendances Student 1 in Month 8
        Attendance::create([
            'student_id' => $this->student1->id,
            'att_date' => '2026-08-05',
            'status' => 'hadir',
            'source' => 'gate',
            'recorded_by' => $this->walasUser->id,
        ]);
        Attendance::create([
            'student_id' => $this->student1->id,
            'att_date' => '2026-08-06',
            'status' => 'hadir',
            'source' => 'gate',
            'recorded_by' => $this->walasUser->id,
        ]);
        Attendance::create([
            'student_id' => $this->student1->id,
            'att_date' => '2026-08-07',
            'status' => 'sakit',
            'source' => 'gate',
            'recorded_by' => $this->walasUser->id,
        ]);

        // Character Note Student 1
        CharacterNote::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'scale_data' => [
                'beriman_bertakwa' => 'Sangat Baik',
                'mandiri' => 'Baik',
            ],
            'homeroom_note' => 'Ahmad menunjukkan ketekunan belajar dan kepemimpinan yang baik di kelas.',
            'author_id' => $this->walasUser->id,
        ]);
    }

    /**
     * BE-GRD-03: Generate E-Progress Report bulanan membekukan nilai, presensi, catatan karakter dalam snapshot.
     */
    public function test_be_grd_03_generate_progress_report_snapshots_data_correctly(): void
    {
        $response = $this->actingAs($this->walasUser, 'sanctum')
            ->postJson('/api/v1/progress-reports/generate', [
                'period_id' => $this->periodMonth8->id,
                'student_id' => $this->student1->id,
                'status' => 'menunggu_acc',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.student_id', $this->student1->id)
            ->assertJsonPath('data.period_id', $this->periodMonth8->id)
            ->assertJsonPath('data.status', 'menunggu_acc');

        $report = ProgressReport::where('student_id', $this->student1->id)
            ->where('period_id', $this->periodMonth8->id)
            ->first();

        $this->assertNotNull($report);
        $this->assertNotEmpty($report->verify_token);

        // Verifikasi snapshot data
        $snapshot = $report->data_snapshot;
        $this->assertEquals('Ahmad Fikri Pratama', $snapshot['student']['full_name']);
        $this->assertEquals('X-IPA-1', $snapshot['student']['class_name']);
        $this->assertEquals(8, $snapshot['period']['month']);

        // Verifikasi nilai terbobot: (80*40 + 90*60)/100 = (3200 + 5400)/100 = 86.0
        $this->assertCount(1, $snapshot['grades']);
        $this->assertEquals('Matematika Wajib', $snapshot['grades'][0]['subject_name']);
        $this->assertEquals(86.00, $snapshot['grades'][0]['final_score']);

        // Verifikasi kehadiran: 2 hadir, 1 sakit => total 3, percentage = 66.67%
        $this->assertEquals(2, $snapshot['attendance']['hadir']);
        $this->assertEquals(1, $snapshot['attendance']['sakit']);
        $this->assertEquals(66.67, $snapshot['attendance']['percentage']);

        // Verifikasi catatan karakter & walas
        $this->assertEquals('Ahmad menunjukkan ketekunan belajar dan kepemimpinan yang baik di kelas.', $snapshot['character']['homeroom_note']);
        $this->assertEquals('Sangat Baik', $snapshot['character']['scale_data']['beriman_bertakwa']);
    }

    /**
     * BE-GRD-03: Generate massal E-Progress Report untuk seluruh siswa di satu rombel.
     */
    public function test_be_grd_03_bulk_generate_progress_report_for_class(): void
    {
        $response = $this->actingAs($this->walasUser, 'sanctum')
            ->postJson('/api/v1/progress-reports/generate', [
                'period_id' => $this->periodMonth8->id,
                'class_id' => $this->classA->id,
                'status' => 'menunggu_acc',
            ]);

        $response->assertStatus(201)
            ->assertJsonCount(2, 'data');

        // Rapor harus terbuat untuk student1 dan student2
        $this->assertDatabaseHas('progress_reports', [
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'status' => 'menunggu_acc',
        ]);

        $this->assertDatabaseHas('progress_reports', [
            'student_id' => $this->student2->id,
            'period_id' => $this->periodMonth8->id,
            'status' => 'menunggu_acc',
        ]);
    }

    /**
     * BE-GRD-03: Rapor yang sudah disetujui atau terbit tidak boleh di-overwrite/generate ulang.
     */
    public function test_be_grd_03_cannot_regenerate_approved_or_published_report(): void
    {
        ProgressReport::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => ['student' => ['name' => 'Snapshot Lama']],
            'status' => 'disetujui',
            'verify_token' => 'token-test-disetujui',
            'approved_by' => $this->principalUser->id,
        ]);

        $response = $this->actingAs($this->walasUser, 'sanctum')
            ->postJson('/api/v1/progress-reports/generate', [
                'period_id' => $this->periodMonth8->id,
                'student_id' => $this->student1->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'BUSINESS_RULE_VIOLATION');
    }

    /**
     * BE-GRD-03: Lifecycle status & Pengesahan / ACC oleh Kepala Sekolah.
     */
    public function test_be_grd_03_status_lifecycle_and_principal_approval(): void
    {
        $report = ProgressReport::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => ['student' => ['name' => 'Ahmad Fikri']],
            'status' => 'menunggu_acc',
            'verify_token' => 'token-approval-test',
        ]);

        // Kepala Sekolah menyetujui (ACC)
        $response = $this->actingAs($this->principalUser, 'sanctum')
            ->patchJson("/api/v1/progress-reports/{$report->id}/approve", [
                'status' => 'disetujui',
                'note' => 'Disetujui untuk dibagikan ke siswa dan orang tua.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'disetujui')
            ->assertJsonPath('data.approved_by', $this->principalUser->id);

        $this->assertDatabaseHas('progress_reports', [
            'id' => $report->id,
            'status' => 'disetujui',
            'approved_by' => $this->principalUser->id,
        ]);

        // Publish langsung ke ortu/siswa
        $this->app['auth']->forgetGuards();
        $responsePublish = $this->actingAs($this->principalUser, 'sanctum')
            ->patchJson("/api/v1/progress-reports/{$report->id}/approve", [
                'status' => 'terbit',
            ]);

        $responsePublish->assertStatus(200)
            ->assertJsonPath('data.status', 'terbit');

        // Status dapat dikembalikan ke draft jika ada revisi
        $this->app['auth']->forgetGuards();
        $responseDraft = $this->actingAs($this->principalUser, 'sanctum')
            ->patchJson("/api/v1/progress-reports/{$report->id}/approve", [
                'status' => 'draft',
                'note' => 'Perbaiki nilai tugas yang salah input.',
            ]);

        $responseDraft->assertStatus(200)
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.approved_by', null);
    }

    /**
     * BE-GRD-03: User tanpa wewenang (guru biasa atau murid) tidak dapat mengesahkan laporan.
     */
    public function test_be_grd_03_unauthorized_user_cannot_approve_report(): void
    {
        $report = ProgressReport::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => ['student' => ['name' => 'Ahmad Fikri']],
            'status' => 'menunggu_acc',
            'verify_token' => 'token-unauthorized-test',
        ]);

        // Walas mencoba approve tanpa role kepsek / permission report approve
        $response = $this->actingAs($this->walasUser, 'sanctum')
            ->patchJson("/api/v1/progress-reports/{$report->id}/approve", [
                'status' => 'disetujui',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');

        // Siswa mencoba approve
        $this->app['auth']->forgetGuards();
        $responseStudent = $this->actingAs($this->student1User, 'sanctum')
            ->patchJson("/api/v1/progress-reports/{$report->id}/approve", [
                'status' => 'disetujui',
            ]);

        $responseStudent->assertStatus(403);
    }

    /**
     * BE-GRD-03: Siswa & Wali Murid tidak dapat melihat laporan yang masih status draft atau menunggu_acc.
     */
    public function test_be_grd_03_student_and_guardian_scoping_cannot_see_draft_or_pending_report(): void
    {
        $reportPending = ProgressReport::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => ['student' => ['name' => 'Ahmad']],
            'status' => 'menunggu_acc',
            'verify_token' => 'token-pending-test',
        ]);

        // Siswa 1 mencoba melihat list laporan
        $responseList = $this->actingAs($this->student1User, 'sanctum')
            ->getJson('/api/v1/progress-reports');

        $responseList->assertStatus(200)
            ->assertJsonCount(0, 'data');

        // Siswa 1 mencoba akses langsung detail laporan menunggu_acc
        $responseDetail = $this->actingAs($this->student1User, 'sanctum')
            ->getJson("/api/v1/progress-reports/{$reportPending->id}");

        $responseDetail->assertStatus(403);

        // Setelah diterbitkan (terbit), siswa & ortu dapat melihat
        $reportPending->update(['status' => 'terbit', 'approved_by' => $this->principalUser->id]);

        $this->app['auth']->forgetGuards();
        $responseStudentPublished = $this->actingAs($this->student1User, 'sanctum')
            ->getJson("/api/v1/progress-reports/{$reportPending->id}");

        $responseStudentPublished->assertStatus(200)
            ->assertJsonPath('data.status', 'terbit');

        $this->app['auth']->forgetGuards();
        $responseGuardianPublished = $this->actingAs($this->guardianUser, 'sanctum')
            ->getJson("/api/v1/progress-reports/{$reportPending->id}");

        $responseGuardianPublished->assertStatus(200)
            ->assertJsonPath('data.id', $reportPending->id);
    }

    /**
     * BE-GRD-03: Otorisasi IDOR - Orang tua murid A tidak bisa melihat laporan murid B.
     */
    public function test_be_grd_03_guardian_cannot_see_other_students_report_idor(): void
    {
        $reportStudent2 = ProgressReport::create([
            'student_id' => $this->student2->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => ['student' => ['name' => 'Siti Aisyah']],
            'status' => 'terbit',
            'verify_token' => 'token-student2-test',
            'approved_by' => $this->principalUser->id,
        ]);

        // Guardian 1 (ortu Ahmad) mencoba melihat laporan Siti
        $response = $this->actingAs($this->guardianUser, 'sanctum')
            ->getJson("/api/v1/progress-reports/{$reportStudent2->id}");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }

    /**
     * BE-GRD-03: Unduh PDF 1 halaman bertanda tangan QR dan format dokumen PDF standar.
     */
    public function test_be_grd_03_download_pdf_generates_valid_pdf_stream_with_qr_token(): void
    {
        $report = ProgressReport::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => [
                'student' => [
                    'full_name' => 'Ahmad Fikri Pratama',
                    'nis' => '202600001',
                    'nisn' => '0098765431',
                    'class_name' => 'X-IPA-1',
                ],
                'period' => [
                    'month' => 8,
                    'semester_name' => 'Semester Ganjil 2026/2027',
                ],
                'grades' => [
                    [
                        'subject_name' => 'Matematika Wajib',
                        'final_score' => 86.00,
                    ],
                ],
                'attendance' => [
                    'hadir' => 20,
                    'sakit' => 1,
                    'izin' => 1,
                    'alpa' => 0,
                    'percentage' => 90.91,
                ],
                'character' => [
                    'homeroom_note' => 'Terus pertahankan prestasi akademiknya.',
                ],
            ],
            'status' => 'terbit',
            'verify_token' => 'valid-pdf-test-token-12345',
            'approved_by' => $this->principalUser->id,
        ]);

        $response = $this->actingAs($this->student1User, 'sanctum')
            ->get("/api/v1/progress-reports/{$report->id}/pdf");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
        $content = $response->getContent();
        $this->assertStringStartsWith('%PDF-1.4', $content);
        $this->assertStringContainsString('valid-pdf-test-token-12345', $content);
        $this->assertStringContainsString('E-PROGRESS REPORT BULANAN', $content);
    }

    /**
     * BE-GRD-03: Halaman publik verifikasi dokumen QR mengembalikan data valid untuk laporan disetujui/terbit.
     */
    public function test_be_grd_03_public_verification_endpoint_for_valid_approved_report(): void
    {
        $report = ProgressReport::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => [
                'school_name' => 'Portal Sekolah Satu Pintu SISTLABUM',
                'student' => [
                    'full_name' => 'Ahmad Fikri Pratama',
                    'nis' => '202600001',
                    'nisn' => '0098765431',
                    'class_name' => 'X-IPA-1',
                ],
                'period' => [
                    'month' => 8,
                    'semester_name' => 'Semester Ganjil 2026/2027',
                    'academic_year' => '2026/2027',
                ],
            ],
            'status' => 'disetujui',
            'verify_token' => 'qr-token-valid-998877',
            'approved_by' => $this->principalUser->id,
        ]);

        // Verifikasi publik TANPA login token
        $response = $this->getJson('/api/v1/public/verify/qr-token-valid-998877');

        $response->assertStatus(200)
            ->assertJsonPath('data.is_valid', true)
            ->assertJsonPath('data.document_title', 'E-Progress Report Bulanan')
            ->assertJsonPath('data.student.name', 'Ahmad Fikri Pratama')
            ->assertJsonPath('data.student.nisn', '0098765431')
            ->assertJsonPath('data.approval.approved_by', $this->principalUser->username);
    }

    /**
     * BE-GRD-03: Verifikasi publik mengembalikan 404 jika token tidak ada, dan is_valid: false jika dokumen belum di-ACC.
     */
    public function test_be_grd_03_public_verification_endpoint_for_unapproved_report_and_invalid_token(): void
    {
        // Token tidak ada -> 404
        $responseNotFound = $this->getJson('/api/v1/public/verify/token-tidak-terdaftar-xyz');
        $responseNotFound->assertStatus(404)
            ->assertJsonPath('error.code', 'NOT_FOUND');

        // Token ada tapi status masih menunggu_acc -> 200 dengan is_valid: false
        ProgressReport::create([
            'student_id' => $this->student1->id,
            'period_id' => $this->periodMonth8->id,
            'data_snapshot' => ['student' => ['full_name' => 'Ahmad']],
            'status' => 'menunggu_acc',
            'verify_token' => 'qr-token-draft-112233',
        ]);

        $responseDraft = $this->getJson('/api/v1/public/verify/qr-token-draft-112233');
        $responseDraft->assertStatus(200)
            ->assertJsonPath('data.is_valid', false)
            ->assertJsonPath('data.status', 'menunggu_acc');
    }

    /**
     * BE-GRD-03: Validasi input ketika student_id maupun class_id tidak disertakan saat generate.
     */
    public function test_be_grd_03_validation_error_when_neither_student_nor_class_provided(): void
    {
        $response = $this->actingAs($this->walasUser, 'sanctum')
            ->postJson('/api/v1/progress-reports/generate', [
                'period_id' => $this->periodMonth8->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['target']);
    }
}
