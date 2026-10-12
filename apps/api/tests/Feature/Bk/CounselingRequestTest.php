<?php

namespace Tests\Feature\Bk;

use App\Models\AcademicYear;
use App\Models\ClassStudent;
use App\Models\CounselingRequest;
use App\Models\GradeLevel;
use App\Models\Guardian;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CounselingRequestTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $counselorUser;

    protected User $studentUser1;

    protected User $studentUser2;

    protected User $guardianUser;

    protected Student $student1;

    protected Student $student2;

    protected Guardian $guardian;

    protected SchoolClass $classA;

    protected function setUp(): void
    {
        parent::setUp();

        $roleAdmin = Role::firstOrCreate(['code' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $roleCounselor = Role::firstOrCreate(['code' => 'counselor'], ['name' => 'Guru BK', 'is_system' => true]);
        $roleStudent = Role::firstOrCreate(['code' => 'student'], ['name' => 'Siswa', 'is_system' => true]);
        $roleGuardian = Role::firstOrCreate(['code' => 'guardian'], ['name' => 'Wali Murid', 'is_system' => true]);

        $permBk = Permission::firstOrCreate(['code' => 'bk.counseling.manage'], ['description' => 'Mengelola bimbingan konseling']);
        $roleCounselor->permissions()->syncWithoutDetaching([$permBk->id]);
        $roleAdmin->permissions()->syncWithoutDetaching([$permBk->id]);

        $this->adminUser = User::create([
            'username' => 'admin_counseling',
            'email' => 'admin_counseling@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->attach($roleAdmin->id);

        $this->counselorUser = User::create([
            'username' => 'guru_bk_req',
            'email' => 'counselor_req@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->counselorUser->roles()->attach($roleCounselor->id);

        Teacher::create([
            'user_id' => $this->counselorUser->id,
            'nip' => '198305052008012005',
            'full_name' => 'Siti Nurhaliza, M.Pd (Konselor)',
            'gender' => 'P',
        ]);

        $this->studentUser1 = User::create([
            'username' => '20261011',
            'email' => 'siswa1@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->studentUser1->roles()->attach($roleStudent->id);

        $this->student1 = Student::create([
            'user_id' => $this->studentUser1->id,
            'full_name' => 'Ahmad Fajar',
            'nis' => '20261011',
            'nisn' => '0012345671',
            'nik_enc' => 'enc_3578010101010011',
            'gender' => 'L',
            'birth_place' => 'Malang',
            'birth_date' => '2010-01-01',
            'entry_date' => '2026-07-01',
            'status' => 'aktif',
        ]);

        $this->studentUser2 = User::create([
            'username' => '20261012',
            'email' => 'siswa2@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->studentUser2->roles()->attach($roleStudent->id);

        $this->student2 = Student::create([
            'user_id' => $this->studentUser2->id,
            'full_name' => 'Budi Santoso',
            'nis' => '20261012',
            'nisn' => '0012345672',
            'nik_enc' => 'enc_3578010101010012',
            'gender' => 'L',
            'birth_place' => 'Malang',
            'birth_date' => '2010-02-02',
            'entry_date' => '2026-07-01',
            'status' => 'aktif',
        ]);

        $this->guardianUser = User::create([
            'username' => 'wali_fajar',
            'email' => 'ortu_fajar@gmail.com',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->guardianUser->roles()->attach($roleGuardian->id);

        $this->guardian = Guardian::create([
            'user_id' => $this->guardianUser->id,
            'full_name' => 'Pak Suryo (Ayah Ahmad Fajar)',
            'phone' => '081234567890',
        ]);

        $this->guardian->students()->attach($this->student1->id, [
            'relationship' => 'ayah',
            'is_primary' => true,
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

        $this->classA = SchoolClass::create([
            'academic_year_id' => $ay->id,
            'grade_level_id' => $gradeLevel->id,
            'name' => 'X-MIPA-1',
        ]);

        ClassStudent::create([
            'class_id' => $this->classA->id,
            'student_id' => $this->student1->id,
            'joined_at' => '2026-07-15',
        ]);
    }

    /**
     * BE-BK-03: Siswa dapat mengajukan permintaan konseling untuk dirinya sendiri.
     */
    public function test_be_bk_03_student_can_create_counseling_request(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->postJson('/api/v1/counseling/requests', [
                'student_id' => $this->student1->id,
                'topic' => 'Konsultasi pemilihan jurusan kuliah teknik informatika',
                'preferred_date' => Carbon::now()->addDays(3)->toDateString(),
                'preferred_time' => '10:00 - 11:00',
                'notes' => 'Ingin diskusi peluang beasiswa dan universitas terbaik.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.student_id', $this->student1->id)
            ->assertJsonPath('data.requester_role', 'student')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('counseling_requests', [
            'student_id' => $this->student1->id,
            'requested_by' => $this->studentUser1->id,
            'requester_role' => 'student',
            'topic' => 'Konsultasi pemilihan jurusan kuliah teknik informatika',
            'status' => 'pending',
        ]);
    }

    /**
     * BE-BK-03: Siswa dilarang mengajukan permintaan konseling atas nama siswa lain (anti-IDOR).
     */
    public function test_be_bk_03_student_cannot_create_counseling_request_for_other_student(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->postJson('/api/v1/counseling/requests', [
                'student_id' => $this->student2->id, // Siswa lain
                'topic' => 'Topik yang tidak sah',
            ]);

        $response->assertStatus(403);
    }

    /**
     * BE-BK-03: Orang tua / wali murid dapat mengajukan permintaan konseling untuk anaknya yang terdaftar.
     */
    public function test_be_bk_03_guardian_can_create_counseling_request_for_ward(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->guardianUser, 'sanctum')
            ->postJson('/api/v1/counseling/requests', [
                'student_id' => $this->student1->id,
                'topic' => 'Perubahan perilaku anak di rumah dan kesulitan belajar',
                'preferred_date' => Carbon::now()->addDays(5)->toDateString(),
                'preferred_time' => '09:00',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.student_id', $this->student1->id)
            ->assertJsonPath('data.requester_role', 'guardian')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('counseling_requests', [
            'student_id' => $this->student1->id,
            'requested_by' => $this->guardianUser->id,
            'requester_role' => 'guardian',
            'status' => 'pending',
        ]);
    }

    /**
     * BE-BK-03: Orang tua / wali murid dilarang mengajukan konseling untuk anak yang bukan perwaliannya (anti-IDOR).
     */
    public function test_be_bk_03_guardian_cannot_create_counseling_request_for_unrelated_student(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->guardianUser, 'sanctum')
            ->postJson('/api/v1/counseling/requests', [
                'student_id' => $this->student2->id, // Bukan anaknya
                'topic' => 'Permintaan tidak sah untuk anak orang lain',
            ]);

        $response->assertStatus(403);
    }

    /**
     * BE-BK-03: Guru BK dapat menjadwalkan permintaan konseling dan mencatat audit log.
     */
    public function test_be_bk_03_counselor_can_schedule_request(): void
    {
        $cReq = CounselingRequest::create([
            'student_id' => $this->student1->id,
            'requested_by' => $this->studentUser1->id,
            'requester_role' => 'student',
            'topic' => 'Masalah motivasi belajar',
            'status' => 'pending',
        ]);

        $scheduledTime = Carbon::now()->addDays(2)->setTime(10, 0, 0)->toDateTimeString();

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->counselorUser, 'sanctum')
            ->patchJson("/api/v1/counseling/requests/{$cReq->id}/schedule", [
                'scheduled_at' => $scheduledTime,
                'notes' => 'Dijadwalkan di Ruang BK 1 bersama Bu Rahmawati.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'scheduled')
            ->assertJsonPath('data.counselor_id', $this->counselorUser->id);

        $this->assertDatabaseHas('counseling_requests', [
            'id' => $cReq->id,
            'status' => 'scheduled',
            'counselor_id' => $this->counselorUser->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->counselorUser->id,
            'action' => 'counseling_request.schedule',
            'entity' => 'counseling_requests',
            'entity_id' => $cReq->id,
        ]);
    }

    /**
     * BE-BK-03: Guru BK dapat menolak permintaan konseling disertai alasan penolakan.
     */
    public function test_be_bk_03_counselor_can_reject_request(): void
    {
        $cReq = CounselingRequest::create([
            'student_id' => $this->student1->id,
            'requested_by' => $this->studentUser1->id,
            'requester_role' => 'student',
            'topic' => 'Topik yang kurang relevan untuk konseling BK',
            'status' => 'pending',
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->counselorUser, 'sanctum')
            ->patchJson("/api/v1/counseling/requests/{$cReq->id}/reject", [
                'rejection_reason' => 'Topik diarahkan untuk konsultasi langsung dengan wali kelas atau guru mapel terkait.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'Topik diarahkan untuk konsultasi langsung dengan wali kelas atau guru mapel terkait.');

        $this->assertDatabaseHas('counseling_requests', [
            'id' => $cReq->id,
            'status' => 'rejected',
            'rejection_reason' => 'Topik diarahkan untuk konsultasi langsung dengan wali kelas atau guru mapel terkait.',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->counselorUser->id,
            'action' => 'counseling_request.reject',
            'entity_id' => $cReq->id,
        ]);
    }

    /**
     * BE-BK-03: Pengguna tidak berwenang (misal siswa lain) dilarang menjadwalkan konseling.
     */
    public function test_be_bk_03_unauthorized_user_cannot_schedule_request(): void
    {
        $cReq = CounselingRequest::create([
            'student_id' => $this->student1->id,
            'requested_by' => $this->studentUser1->id,
            'requester_role' => 'student',
            'topic' => 'Topik tes wewenang',
            'status' => 'pending',
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->patchJson("/api/v1/counseling/requests/{$cReq->id}/schedule", [
                'scheduled_at' => Carbon::now()->addDay()->toDateTimeString(),
            ]);

        $response->assertStatus(403);
    }

    /**
     * BE-BK-03: Pemohon dapat membatalkan permintaan konseling yang masih berstatus pending.
     */
    public function test_be_bk_03_requester_can_cancel_pending_request(): void
    {
        $cReq = CounselingRequest::create([
            'student_id' => $this->student1->id,
            'requested_by' => $this->studentUser1->id,
            'requester_role' => 'student',
            'topic' => 'Permintaan yang ingin dibatalkan oleh siswa sendiri',
            'status' => 'pending',
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->deleteJson("/api/v1/counseling/requests/{$cReq->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('counseling_requests', [
            'id' => $cReq->id,
            'status' => 'cancelled',
        ]);
    }

    /**
     * BE-BK-03: Scoping peranan pada daftar permintaan konseling:
     * Siswa hanya melihat miliknya, Guru BK melihat seluruh permintaan.
     */
    public function test_be_bk_03_role_scoping_on_list_requests(): void
    {
        // Request milik siswa 1
        $req1 = CounselingRequest::create([
            'student_id' => $this->student1->id,
            'requested_by' => $this->studentUser1->id,
            'requester_role' => 'student',
            'topic' => 'Permintaan Siswa 1',
            'status' => 'pending',
        ]);

        // Request milik siswa 2
        $req2 = CounselingRequest::create([
            'student_id' => $this->student2->id,
            'requested_by' => $this->studentUser2->id,
            'requester_role' => 'student',
            'topic' => 'Permintaan Siswa 2',
            'status' => 'pending',
        ]);

        $this->app['auth']->forgetGuards();

        // 1. Siswa 1 hanya melihat permintaan miliknya
        $respStudent = $this->actingAs($this->studentUser1, 'sanctum')
            ->getJson('/api/v1/counseling/requests');

        $respStudent->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $req1->id);

        $this->app['auth']->forgetGuards();

        // 2. Guru BK dapat melihat kedua permintaan siswa
        $respCounselor = $this->actingAs($this->counselorUser, 'sanctum')
            ->getJson('/api/v1/counseling/requests');

        $respCounselor->assertStatus(200)
            ->assertJsonPath('meta.total', 2);
    }
}
