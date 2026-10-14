<?php

namespace Tests\Feature\Cbt;

use App\Models\AcademicYear;
use App\Models\ClassStudent;
use App\Models\Exam;
use App\Models\ExamParticipant;
use App\Models\ExamQuestion;
use App\Models\ExamRoom;
use App\Models\ExamSession;
use App\Models\GradeLevel;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionOption;
use App\Models\Role;
use App\Models\Room;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ExamTimingTest extends TestCase
{
    use RefreshDatabase;

    protected User $studentUser;

    protected Student $student;

    protected Exam $exam;

    protected ExamRoom $examRoom;

    protected Question $question;

    protected function setUp(): void
    {
        parent::setUp();

        $roleStudent = Role::firstOrCreate(['code' => 'student'], ['name' => 'Siswa', 'is_system' => true]);
        $roleTeacher = Role::firstOrCreate(['code' => 'teacher'], ['name' => 'Guru', 'is_system' => true]);
        $roleAdmin = Role::firstOrCreate(['code' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);

        $adminUser = User::create([
            'username' => 'admin_cbt_test',
            'email' => 'admin_cbt_test@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $adminUser->roles()->attach($roleAdmin->id);

        $this->studentUser = User::create([
            'username' => '20269901',
            'email' => 'siswa_cbt@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $this->studentUser->roles()->attach($roleStudent->id);

        $teacherUser = User::create([
            'username' => 'proctor_cbt_test',
            'email' => 'proctor_cbt_test@sekolah.sch.id',
            'password_hash' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $teacherUser->roles()->attach($roleTeacher->id);

        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'nip' => '198501012010011099',
            'full_name' => 'Proctor Test, S.Pd',
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
            'homeroom_teacher_id' => $teacher->id,
            'name' => '10-A',
            'capacity' => 36,
        ]);

        $subject = Subject::create([
            'name' => 'Matematika Wajib',
            'code' => 'MAT-10',
            'subject_group' => 'muatan_nasional',
        ]);

        $room = Room::create([
            'name' => 'Lab Komputer 1',
            'code' => 'LAB-01',
            'room_type' => 'laboratorium',
            'capacity' => 40,
        ]);

        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'full_name' => 'Citra Kirana',
            'nis' => '20269901',
            'nisn' => '0099887766',
            'nik_enc' => 'enc_3578010101019999',
            'gender' => 'P',
            'birth_place' => 'Malang',
            'birth_date' => '2010-05-15',
            'entry_date' => '2026-07-01',
            'status' => 'aktif',
        ]);

        ClassStudent::create([
            'class_id' => $classA->id,
            'student_id' => $this->student->id,
            'joined_at' => '2026-07-15',
        ]);

        $this->exam = Exam::create([
            'subject_id' => $subject->id,
            'created_by' => $adminUser->id,
            'title' => 'Asesmen Harian Aljabar',
            'exam_type' => 'harian',
            'duration_min' => 90,
            'start_at' => Carbon::now()->subMinutes(15),
            'end_at' => Carbon::now()->addHours(3),
            'passing_grade' => 75.0,
            'status' => 'berlangsung',
        ]);

        $this->examRoom = ExamRoom::create([
            'exam_id' => $this->exam->id,
            'room_id' => $room->id,
            'proctor_id' => $teacherUser->id,
            'session_no' => 1,
            'token' => 'TOKENCBT',
            'token_expires_at' => Carbon::now()->addHours(2),
        ]);

        ExamParticipant::create([
            'exam_id' => $this->exam->id,
            'student_id' => $this->student->id,
            'exam_room_id' => $this->examRoom->id,
            'package_code' => 'A',
        ]);

        $bank = QuestionBank::create([
            'name' => 'Bank Soal Aljabar',
            'subject_id' => $subject->id,
            'grade_level_id' => $gradeLevel->id,
            'owner_id' => $adminUser->id,
        ]);

        $this->question = Question::create([
            'bank_id' => $bank->id,
            'question_type' => 'pg',
            'body' => ['content' => 'Nilai x dari 2x + 4 = 10 adalah?'],
            'weight' => 10.0,
            'version' => 1,
            'status' => 'aktif',
        ]);

        QuestionOption::create([
            'question_id' => $this->question->id,
            'label' => 'A',
            'body' => ['text' => '3'],
            'is_correct' => true,
        ]);

        QuestionOption::create([
            'question_id' => $this->question->id,
            'label' => 'B',
            'body' => ['text' => '5'],
            'is_correct' => false,
        ]);

        ExamQuestion::create([
            'exam_id' => $this->exam->id,
            'question_id' => $this->question->id,
            'sort_order' => 1,
            'package_code' => 'A',
        ]);
    }

    /**
     * GAP-02: Start sesi menghitung ends_at = min(started_at + durasi, batas akhir jadwal ujian).
     */
    public function test_gap_02_start_session_calculates_ends_at_bounded_by_exam_schedule_end(): void
    {
        // Set batas akhir ujian hanya 25 menit dari sekarang (kurang dari durasi 90 menit)
        $this->exam->update([
            'duration_min' => 90,
            'end_at' => Carbon::now()->addMinutes(25),
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/v1/exams/{$this->exam->id}/start-session", [
                'token' => 'TOKENCBT',
            ]);

        $response->assertStatus(200);

        $session = ExamSession::where('exam_id', $this->exam->id)->where('student_id', $this->student->id)->firstOrFail();
        $this->assertNotNull($session->ends_at);
        $this->assertNotNull($session->started_at);

        // ends_at harus dibatasi oleh exam end_at (kurang lebih 25 menit dari sekarang, bukan 90 menit)
        $diffToEnd = Carbon::now()->diffInSeconds($session->ends_at);
        $this->assertLessThanOrEqual(25 * 60 + 5, $diffToEnd);
        $this->assertGreaterThanOrEqual(25 * 60 - 5, $diffToEnd);

        // Response memuat server_time, ends_at, violation_count
        $response->assertJsonStructure([
            'data' => [
                'session_id',
                'ends_at',
                'server_time',
            ],
        ]);
    }

    /**
     * GAP-02: Endpoint start/resume bersifat idempoten: jika sesi aktif sudah ada, kembalikan sesi yang sama
     * tanpa memulai ulang timer, serta sertakan jawaban yang sudah tersimpan.
     */
    public function test_gap_02_resume_session_is_idempotent_and_does_not_reset_timer(): void
    {
        $this->app['auth']->forgetGuards();

        // 1. Mulai sesi pertama kali
        $res1 = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/v1/exams/{$this->exam->id}/start-session", [
                'token' => 'TOKENCBT',
            ]);
        $res1->assertStatus(200);

        $session = ExamSession::where('exam_id', $this->exam->id)->where('student_id', $this->student->id)->firstOrFail();
        $initialStartedAt = $session->started_at;
        $initialEndsAt = $session->ends_at;

        // 2. Simpan jawaban soal
        $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/v1/exams/{$this->exam->id}/save-answer", [
                'question_id' => $this->question->id,
                'answer' => ['opt' => 'A'],
                'is_flagged' => true,
            ])
            ->assertStatus(200);

        // Simulasikan waktu berlalu 15 menit
        Carbon::setTestNow(Carbon::now()->addMinutes(15));

        // 3. Resume sesi (panggil start-session lagi)
        $res2 = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/v1/exams/{$this->exam->id}/start-session", [
                'token' => 'TOKENCBT',
            ]);
        $res2->assertStatus(200);

        $session->refresh();

        // started_at dan ends_at TIDAK boleh berubah / ter-reset!
        $this->assertEquals($initialStartedAt->toIso8601String(), $session->started_at->toIso8601String());
        $this->assertEquals($initialEndsAt->toIso8601String(), $session->ends_at->toIso8601String());

        // Jawaban tersimpan harus disertakan
        $this->assertNotEmpty($res2->json('data.answers'));
        $this->assertEquals(['opt' => 'A'], $res2->json("data.answers.{$this->question->id}.answer"));

        Carbon::setTestNow();
    }

    /**
     * GAP-02: Simpan jawaban ditolak jika sekarang > ends_at (+ toleransi 5 detik)
     * dengan kode error khusus EXAM_TIME_OVER.
     */
    public function test_gap_02_save_answer_rejected_after_ends_at_with_exam_time_over(): void
    {
        $session = ExamSession::create([
            'exam_id' => $this->exam->id,
            'student_id' => $this->student->id,
            'status' => 'mengerjakan',
            'started_at' => Carbon::now()->subMinutes(90),
            'ends_at' => Carbon::now()->subSeconds(10), // Lewat ends_at lebih dari toleransi 5 detik
            'deadline_at' => Carbon::now()->subSeconds(10),
            'seed' => 'seedtimeout',
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/v1/exams/{$this->exam->id}/save-answer", [
                'question_id' => $this->question->id,
                'answer' => ['opt' => 'A'],
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'EXAM_TIME_OVER');

        $session->refresh();
        $this->assertEquals('selesai', $session->status);
    }

    /**
     * GAP-02: Submit ujian harus idempoten (submit berulang kali mengembalikan 200).
     */
    public function test_gap_02_finish_session_is_idempotent(): void
    {
        ExamSession::create([
            'exam_id' => $this->exam->id,
            'student_id' => $this->student->id,
            'status' => 'mengerjakan',
            'started_at' => Carbon::now()->subMinutes(30),
            'ends_at' => Carbon::now()->addMinutes(60),
            'deadline_at' => Carbon::now()->addMinutes(60),
            'seed' => 'seedidempotentfinish',
        ]);

        $this->app['auth']->forgetGuards();

        // Submit 1
        $res1 = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/v1/exams/{$this->exam->id}/finish-session");
        $res1->assertStatus(200)
            ->assertJsonPath('data.status', 'selesai');

        // Submit 2 (idempoten)
        $res2 = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/v1/exams/{$this->exam->id}/finish-session");
        $res2->assertStatus(200)
            ->assertJsonPath('data.status', 'selesai');
    }

    /**
     * GAP-02: Auto-close scheduled command menutup sesi yang lewat ends_at.
     */
    public function test_gap_02_auto_close_expired_sessions_command(): void
    {
        $expiredSession = ExamSession::create([
            'exam_id' => $this->exam->id,
            'student_id' => $this->student->id,
            'status' => 'mengerjakan',
            'started_at' => Carbon::now()->subMinutes(120),
            'ends_at' => Carbon::now()->subMinutes(15),
            'deadline_at' => Carbon::now()->subMinutes(15),
            'seed' => 'seedautoclose',
        ]);

        // Jalankan perintah auto-close
        $this->artisan('cbt:close-expired-sessions')
            ->assertSuccessful();

        $expiredSession->refresh();
        $this->assertEquals('selesai', $expiredSession->status);
        $this->assertNotNull($expiredSession->submitted_at);
    }
}
