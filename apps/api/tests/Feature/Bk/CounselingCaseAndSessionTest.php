<?php

namespace Tests\Feature\Bk;

use App\Models\AcademicYear;
use App\Models\ClassStudent;
use App\Models\CounselingCase;
use App\Models\CounselingSession;
use App\Models\GradeLevel;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CounselingCaseAndSessionTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $counselorUser;

    protected User $principalUser;

    protected User $homeroomTeacherUser;

    protected User $studentUser;

    protected Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $roleAdmin = Role::firstOrCreate(['code' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $roleCounselor = Role::firstOrCreate(['code' => 'counselor'], ['name' => 'Guru BK', 'is_system' => true]);
        $rolePrincipal = Role::firstOrCreate(['code' => 'principal'], ['name' => 'Kepala Sekolah', 'is_system' => true]);
        $roleTeacher = Role::firstOrCreate(['code' => 'teacher'], ['name' => 'Guru', 'is_system' => true]);
        $roleStudent = Role::firstOrCreate(['code' => 'student'], ['name' => 'Siswa', 'is_system' => true]);

        $permBk = Permission::firstOrCreate(['code' => 'bk.counseling.manage'], ['description' => 'Mengelola catatan bimbingan konseling']);
        $roleCounselor->permissions()->syncWithoutDetaching([$permBk->id]);
        $roleAdmin->permissions()->syncWithoutDetaching([$permBk->id]);

        $this->adminUser = User::create([
            'username' => 'admin_bk',
            'email' => 'admin_bk@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->attach($roleAdmin->id);

        $this->counselorUser = User::create([
            'username' => 'guru_bk',
            'email' => 'counselor@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->counselorUser->roles()->attach($roleCounselor->id);

        $this->principalUser = User::create([
            'username' => 'kepsek',
            'email' => 'kepsek@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->principalUser->roles()->attach($rolePrincipal->id);

        $this->homeroomTeacherUser = User::create([
            'username' => 'walas_1',
            'email' => 'walas@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->homeroomTeacherUser->roles()->attach($roleTeacher->id);

        $this->studentUser = User::create([
            'username' => '20261001',
            'email' => 'siswa@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->studentUser->roles()->attach($roleStudent->id);

        $teacherCounselor = Teacher::create([
            'user_id' => $this->counselorUser->id,
            'nip' => '198203032008011003',
            'full_name' => 'Dra. Rahmawati, M.Pd (Konselor)',
            'gender' => 'P',
        ]);

        $teacherHomeroom = Teacher::create([
            'user_id' => $this->homeroomTeacherUser->id,
            'nip' => '198404042009021004',
            'full_name' => 'Bambang Sudarsono, S.Pd',
            'gender' => 'L',
        ]);

        $ay = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'is_active' => true,
        ]);

        $gradeLevel = GradeLevel::create([
            'name' => 'Kelas 10',
            'level' => 10,
        ]);

        $classA = SchoolClass::create([
            'academic_year_id' => $ay->id,
            'grade_level_id' => $gradeLevel->id,
            'homeroom_teacher_id' => $teacherHomeroom->id,
            'name' => '10-A',
            'capacity' => 36,
        ]);

        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'full_name' => 'Ahmad Faiz Pratama',
            'nis' => '20261001',
            'nisn' => '0012345678',
            'nik_enc' => 'enc_3578010101010001',
            'gender' => 'L',
            'birth_place' => 'Malang',
            'birth_date' => '2010-01-01',
            'entry_date' => '2026-07-01',
            'status' => 'aktif',
        ]);

        ClassStudent::create([
            'class_id' => $classA->id,
            'student_id' => $this->student->id,
            'joined_at' => '2026-07-15',
        ]);
    }

    /**
     * BE-BK-01: Guru BK dapat membuat kasus konseling dan ringkasan tersimpan terenkripsi at-rest.
     */
    public function test_be_bk_01_counselor_can_create_case_with_at_rest_encryption(): void
    {
        $this->app['auth']->forgetGuards();

        $secretSummary = 'Siswa mengalami kecemasan sosial dan penurunan motivasi belajar drastis.';

        $response = $this->actingAs($this->counselorUser, 'sanctum')
            ->postJson('/api/v1/counseling/cases', [
                'student_id' => $this->student->id,
                'category' => 'Pribadi',
                'status' => 'aktif',
                'summary' => $secretSummary,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.category', 'Pribadi')
            ->assertJsonPath('data.status', 'aktif')
            ->assertJsonPath('data.summary_enc', $secretSummary);

        $caseId = $response->json('data.id');

        // Pastikan di database level RAW SQL, teks tidak tersimpan plaintext melainkan terenkripsi
        $rawRecord = DB::table('counseling_cases')->where('id', $caseId)->first();
        $this->assertNotEquals($secretSummary, $rawRecord->summary_enc);
        $this->assertStringNotContainsString('kecemasan sosial', $rawRecord->summary_enc);

        // Pastikan aksi tercatat di audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->counselorUser->id,
            'action' => 'bk_case.create',
            'entity_id' => $caseId,
        ]);
    }

    /**
     * BE-BK-01: Guru BK dapat menambahkan sesi konseling dengan catatan terenkripsi.
     */
    public function test_be_bk_01_counselor_can_add_counseling_session(): void
    {
        $case = CounselingCase::create([
            'student_id' => $this->student->id,
            'counselor_id' => $this->counselorUser->id,
            'category' => 'Belajar',
            'status' => 'aktif',
            'summary_enc' => 'Kendala fokus di kelas',
        ]);

        $this->app['auth']->forgetGuards();

        $privateNotes = 'Sesi 1: Eksplorasi akar permasalahan keluarga yang mempengaruhi fokus belajar siswa.';

        $response = $this->actingAs($this->counselorUser, 'sanctum')
            ->postJson("/api/v1/counseling/cases/{$case->id}/sessions", [
                'session_date' => '2026-10-12',
                'notes' => $privateNotes,
                'follow_up' => 'Konseling lanjutan minggu depan dengan ortu',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.case_id', $case->id)
            ->assertJsonPath('data.notes_enc', $privateNotes);

        $sessionId = $response->json('data.id');

        // RAW verification: Notes terenkripsi
        $rawSession = DB::table('counseling_sessions')->where('id', $sessionId)->first();
        $this->assertNotEquals($privateNotes, $rawSession->notes_enc);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->counselorUser->id,
            'action' => 'bk_session.create',
            'entity_id' => $sessionId,
        ]);
    }

    /**
     * BE-BK-01: Akses baca kasus dan sesi konseling dicatat ke audit log (Security & Privacy Requirement).
     */
    public function test_be_bk_01_reading_case_and_session_triggers_read_audit_log(): void
    {
        $case = CounselingCase::create([
            'student_id' => $this->student->id,
            'counselor_id' => $this->counselorUser->id,
            'category' => 'Sosial',
            'status' => 'aktif',
            'summary_enc' => 'Ringkasan rahasia',
        ]);

        $session = CounselingSession::create([
            'case_id' => $case->id,
            'session_date' => '2026-10-12',
            'notes_enc' => 'Catatan sesi privat rahasia',
        ]);

        $this->app['auth']->forgetGuards();

        // 1. Baca detail kasus
        $resCase = $this->actingAs($this->counselorUser, 'sanctum')
            ->getJson("/api/v1/counseling/cases/{$case->id}");

        $resCase->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->counselorUser->id,
            'action' => 'bk_case.read',
            'entity_id' => $case->id,
        ]);

        // 2. Baca detail sesi
        $resSession = $this->actingAs($this->counselorUser, 'sanctum')
            ->getJson("/api/v1/counseling/sessions/{$session->id}");

        $resSession->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->counselorUser->id,
            'action' => 'bk_session.read',
            'entity_id' => $session->id,
        ]);
    }

    /**
     * BE-BK-01: Kepala Sekolah dapat melihat daftar kasus tetapi isi catatan privat disamarkan (masking).
     */
    public function test_be_bk_01_principal_sees_masked_private_counseling_notes(): void
    {
        $case = CounselingCase::create([
            'student_id' => $this->student->id,
            'counselor_id' => $this->counselorUser->id,
            'category' => 'Pribadi',
            'status' => 'aktif',
            'summary_enc' => 'Rahasia medis/psikologis mendalam',
        ]);

        CounselingSession::create([
            'case_id' => $case->id,
            'session_date' => '2026-10-12',
            'notes_enc' => 'Catatan sensitif wawancara mendalam',
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->principalUser, 'sanctum')
            ->getJson("/api/v1/counseling/cases/{$case->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.category', 'Pribadi')
            ->assertJsonPath('data.summary_enc', '[Ringkasan Sensitif Disamarkan untuk Kepala Sekolah]')
            ->assertJsonPath('data.sessions.0.notes_enc', '[Catatan Sesi Konseling Privat Disamarkan]');
    }

    /**
     * BE-BK-01: Guru mata pelajaran / wali kelas dilarang mengakses kasus privat BK langsung (403 Forbidden).
     */
    public function test_be_bk_01_regular_teacher_forbidden_to_access_private_bk_cases(): void
    {
        $case = CounselingCase::create([
            'student_id' => $this->student->id,
            'counselor_id' => $this->counselorUser->id,
            'category' => 'Pribadi',
            'status' => 'aktif',
            'summary_enc' => 'Data privat',
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->homeroomTeacherUser, 'sanctum')
            ->getJson("/api/v1/counseling/cases/{$case->id}");

        $response->assertStatus(403);
    }

    /**
     * BE-BK-01: Guru dapat membuat rujukan kasus ke BK dan memantau status rujukan.
     */
    public function test_be_bk_01_teacher_can_create_referral_and_track_status(): void
    {
        $this->app['auth']->forgetGuards();

        // 1. Wali kelas membuat rujukan ke BK
        $responseCreate = $this->actingAs($this->homeroomTeacherUser, 'sanctum')
            ->postJson('/api/v1/counseling/referrals', [
                'student_id' => $this->student->id,
                'reason' => 'Siswa sering tertidur di kelas dan terlihat murung selama 1 minggu terakhir.',
            ]);

        $responseCreate->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');

        $referralId = $responseCreate->json('data.id');

        // 2. Guru memantau daftar rujukannya
        $responseList = $this->actingAs($this->homeroomTeacherUser, 'sanctum')
            ->getJson('/api/v1/counseling/referrals');

        $responseList->assertStatus(200)
            ->assertJsonPath('data.0.id', $referralId);

        // 3. Guru BK memperbarui status rujukan menjadi 'diterima'
        $this->app['auth']->forgetGuards();
        $responseUpdate = $this->actingAs($this->counselorUser, 'sanctum')
            ->patchJson("/api/v1/counseling/referrals/{$referralId}/status", [
                'status' => 'diterima',
            ]);

        $responseUpdate->assertStatus(200)
            ->assertJsonPath('data.status', 'diterima');
    }

    /**
     * BE-BK-01: Siswa dilarang keras mengakses API manajemen kasus BK (403 Forbidden).
     */
    public function test_be_bk_01_student_forbidden_to_access_counseling_cases(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/v1/counseling/cases');

        $response->assertStatus(403);
    }
}
