<?php

namespace Tests\Feature\Std;

use App\Models\Achievement;
use App\Models\Competition;
use App\Models\CompetitionEntry;
use App\Models\File;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentPoint;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CompetitionAndAchievementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $kesiswaanUser;

    protected User $teacherUser;

    protected User $studentUser;

    protected Teacher $teacher;

    protected Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $roleAdmin = Role::firstOrCreate(['code' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $roleKesiswaan = Role::firstOrCreate(['code' => 'kesiswaan'], ['name' => 'Staf Kesiswaan', 'is_system' => true]);
        $roleTeacher = Role::firstOrCreate(['code' => 'teacher'], ['name' => 'Guru', 'is_system' => true]);
        $roleStudent = Role::firstOrCreate(['code' => 'student'], ['name' => 'Siswa', 'is_system' => true]);

        $this->adminUser = User::create([
            'username' => 'admin_lomba',
            'email' => 'admin_lomba@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->attach($roleAdmin->id);

        $this->kesiswaanUser = User::create([
            'username' => 'staff_kesiswaan_3',
            'email' => 'kesiswaan3@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->kesiswaanUser->roles()->attach($roleKesiswaan->id);

        $this->teacherUser = User::create([
            'username' => 'guru_pembimbing',
            'email' => 'pembimbing@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->teacherUser->roles()->attach($roleTeacher->id);

        $this->studentUser = User::create([
            'username' => '20261020',
            'email' => 'bayu_siswa@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->studentUser->roles()->attach($roleStudent->id);

        $this->teacher = Teacher::create([
            'user_id' => $this->teacherUser->id,
            'nip' => '198808082012011008',
            'full_name' => 'Dr. Suryo Prasetyo, M.Si',
            'gender' => 'L',
        ]);

        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'nis' => '20261020',
            'nisn' => '0098765488',
            'nik_enc' => '3201010101010088',
            'full_name' => 'Bayu Pratama',
            'gender' => 'L',
            'birth_place' => 'Semarang',
            'birth_date' => '2009-04-10',
            'entry_date' => '2026-07-15',
            'status' => 'active',
        ]);
    }

    public function test_be_std_03_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/v1/competitions')->assertStatus(401);
        $this->getJson('/api/v1/achievements')->assertStatus(401);
    }

    public function test_be_std_03_teacher_can_create_and_update_competition(): void
    {
        $payload = [
            'name' => 'Olimpiade Sains Nasional (OSN) Matematika',
            'organizer' => 'Puspresnas Kemdikbudristek',
            'level' => 'Nasional',
            'category' => 'akademik',
            'held_at' => Carbon::now()->addMonths(1)->toDateString(),
            'description' => 'Ajang talenta sains nasional bidang matematika jenjang SMA/MA',
        ];

        $res = $this->actingAs($this->teacherUser)
            ->postJson('/api/v1/competitions', $payload);

        $res->assertStatus(201)
            ->assertJsonPath('data.name', 'Olimpiade Sains Nasional (OSN) Matematika')
            ->assertJsonPath('data.level', 'Nasional');

        $compId = $res->json('data.id');

        // Update
        $updateRes = $this->actingAs($this->teacherUser)
            ->putJson("/api/v1/competitions/{$compId}", [
                'organizer' => 'BPTI Kemdikbudristek',
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.organizer', 'BPTI Kemdikbudristek');
    }

    public function test_be_std_03_regular_student_cannot_create_competition(): void
    {
        $this->actingAs($this->studentUser)
            ->postJson('/api/v1/competitions', [
                'name' => 'Turnamen E-Sport Ilegal',
                'level' => 'Kota',
                'held_at' => Carbon::now()->toDateString(),
            ])
            ->assertStatus(403);
    }

    public function test_be_std_03_teacher_can_register_student_delegation_entry(): void
    {
        $comp = Competition::create([
            'name' => 'Lomba Debat Bahasa Inggris (NEDS)',
            'level' => 'Provinsi',
            'held_at' => Carbon::now()->addWeeks(2)->toDateString(),
        ]);

        $res = $this->actingAs($this->teacherUser)
            ->postJson("/api/v1/competitions/{$comp->id}/entries", [
                'student_id' => $this->student->id,
                'coach_teacher_id' => $this->teacher->id,
                'notes' => 'Delegasi utama mewakili sekolah',
            ]);

        $res->assertStatus(201)
            ->assertJsonPath('data.competition_id', $comp->id)
            ->assertJsonPath('data.student_id', $this->student->id);

        $this->assertDatabaseHas('competition_entries', [
            'competition_id' => $comp->id,
            'student_id' => $this->student->id,
        ]);
    }

    public function test_be_std_03_cannot_register_same_student_twice_in_competition(): void
    {
        $comp = Competition::create([
            'name' => 'Lomba Catur Cepat Pelajar',
            'level' => 'Kota',
            'held_at' => Carbon::now()->addDays(5)->toDateString(),
        ]);

        CompetitionEntry::create([
            'competition_id' => $comp->id,
            'student_id' => $this->student->id,
        ]);

        // Coba daftarkan kembali siswa yang sama
        $res = $this->actingAs($this->teacherUser)
            ->postJson("/api/v1/competitions/{$comp->id}/entries", [
                'student_id' => $this->student->id,
            ]);

        $res->assertStatus(422)
            ->assertJsonPath('error.code', 'HTTP_ERROR');
    }

    public function test_be_std_03_teacher_can_update_entry_result(): void
    {
        $comp = Competition::create([
            'name' => 'Lomba Desain Poster Lingkungan',
            'level' => 'Kota',
            'held_at' => Carbon::now()->subDays(2)->toDateString(),
        ]);

        $entry = CompetitionEntry::create([
            'competition_id' => $comp->id,
            'student_id' => $this->student->id,
        ]);

        $res = $this->actingAs($this->teacherUser)
            ->putJson("/api/v1/competition-entries/{$entry->id}", [
                'result' => 'Juara 1',
                'notes' => 'Memperoleh piala dan uang pembinaan',
            ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.result', 'Juara 1');

        $this->assertDatabaseHas('competition_entries', [
            'id' => $entry->id,
            'result' => 'Juara 1',
        ]);
    }

    public function test_be_std_03_recording_achievement_automatically_records_student_point(): void
    {
        $comp = Competition::create([
            'name' => 'Olimpiade Biologi Nasional',
            'level' => 'Nasional',
            'held_at' => Carbon::now()->subDays(3)->toDateString(),
        ]);

        // Daftarkan delegasi terlebih dahulu
        $entry = CompetitionEntry::create([
            'competition_id' => $comp->id,
            'student_id' => $this->student->id,
        ]);

        $certFile = File::create([
            'bucket' => 'local',
            'object_key' => 'certs/osn_bio_gold.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 1024,
            'visibility' => 'private',
        ]);

        $trophyFile = File::create([
            'bucket' => 'local',
            'object_key' => 'trophies/piala_emas_osn.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 2048,
            'visibility' => 'public',
        ]);

        $payload = [
            'student_id' => $this->student->id,
            'competition_id' => $comp->id,
            'title' => 'Medali Emas Olimpiade Biologi Nasional 2026',
            'rank_level' => 'Juara 1',
            'achieved_at' => Carbon::now()->toDateString(),
            'certificate_file_id' => $certFile->id,
            'photo_file_id' => $trophyFile->id,
            'points_awarded' => 50,
            'notes' => 'Peringkat 1 dari 150 finalis nasional',
        ];

        $res = $this->actingAs($this->teacherUser)
            ->postJson('/api/v1/achievements', $payload);

        $res->assertStatus(201)
            ->assertJsonPath('data.title', 'Medali Emas Olimpiade Biologi Nasional 2026')
            ->assertJsonPath('data.points_awarded', 50);

        $achievementId = $res->json('data.id');

        // Pastikan entry kompetisi ter-update otomatis dengan achievement_id
        $this->assertEquals($achievementId, $entry->fresh()->achievement_id);
        $this->assertEquals('Juara 1', $entry->fresh()->result);

        // Pastikan poin prestasi otomatis tercatat di student_points
        $this->assertDatabaseHas('student_points', [
            'student_id' => $this->student->id,
            'recorded_by' => $this->teacherUser->id,
            'evidence_file_id' => $certFile->id,
        ]);

        // Pastikan poin prestasi di student_points terhubung ke jenis poin ber-kind 'prestasi'
        $recordedPoint = StudentPoint::where('student_id', $this->student->id)->latest()->first();
        $this->assertNotNull($recordedPoint);
        $this->assertEquals('prestasi', $recordedPoint->pointType->kind);
    }

    public function test_be_std_03_anyone_authenticated_can_view_trophy_gallery_and_achievements(): void
    {
        $trophy = File::create([
            'bucket' => 'local',
            'object_key' => 'trophies/piala_futsal.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 1024,
            'visibility' => 'public',
        ]);

        Achievement::create([
            'student_id' => $this->student->id,
            'title' => 'Juara 1 Lomba Band Pelajar',
            'rank_level' => 'Juara 1',
            'achieved_at' => Carbon::now()->toDateString(),
            'photo_file_id' => $trophy->id,
            'points_awarded' => 30,
        ]);

        // Siswa dapat melihat daftar prestasi dan galeri piala
        $res = $this->actingAs($this->studentUser)
            ->getJson('/api/v1/achievements');

        $res->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Juara 1 Lomba Band Pelajar')
            ->assertJsonPath('data.0.photo_file_id', $trophy->id);
    }

    public function test_be_std_03_student_cannot_create_achievement(): void
    {
        $this->actingAs($this->studentUser)
            ->postJson('/api/v1/achievements', [
                'student_id' => $this->student->id,
                'title' => 'Klaim Juara Sendiri',
                'rank_level' => 'Juara 1',
                'achieved_at' => Carbon::now()->toDateString(),
            ])
            ->assertStatus(403);
    }

    public function test_be_std_03_staff_can_delete_achievement(): void
    {
        $ach = Achievement::create([
            'student_id' => $this->student->id,
            'title' => 'Juara Kaligrafi',
            'rank_level' => 'Harapan 2',
            'achieved_at' => Carbon::now()->toDateString(),
        ]);

        $this->actingAs($this->kesiswaanUser)
            ->deleteJson("/api/v1/achievements/{$ach->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('achievements', ['id' => $ach->id]);
    }
}
