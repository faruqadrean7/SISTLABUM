<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('question_banks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('subject_id');
            $table->uuid('grade_level_id')->nullable();
            $table->uuid('owner_id');
            $table->string('name', 200);
            $table->timestamps();

            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('restrict');
            $table->foreign('grade_level_id')->references('id')->on('grade_levels')->onDelete('set null');
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('bank_id')->index();
            $table->string('question_type', 30); // pg | pg_kompleks | bs | menjodohkan | isian | uraian
            $table->jsonb('body'); // Konten soal, formula, gambar, audio
            $table->string('cp_code', 100)->nullable();
            $table->string('cognitive_level', 20)->default('MOTS'); // LOTS | MOTS | HOTS
            $table->integer('difficulty')->default(3); // 1-5
            $table->decimal('weight', 5, 2)->default(1.0);
            $table->text('explanation')->nullable();
            $table->integer('version')->default(1);
            $table->string('status', 30)->default('draft');
            $table->timestamps();

            $table->foreign('bank_id')->references('id')->on('question_banks')->onDelete('cascade');
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('question_id')->index();
            $table->string('label', 10); // A, B, C, D, E
            $table->jsonb('body');
            $table->boolean('is_correct')->default(false);
            $table->string('match_key', 100)->nullable(); // Menjodohkan
            $table->timestamps();

            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
        });

        Schema::create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('subject_id');
            $table->uuid('created_by');
            $table->uuid('parent_exam_id')->nullable(); // Remedial dari ujian induk
            $table->string('title', 200);
            $table->string('exam_type', 30); // kuis | harian | STS | SAS | remedial | pengayaan
            $table->integer('duration_min');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->decimal('passing_grade', 5, 2)->default(75.0);
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('shuffle_options')->default(true);
            $table->string('package_mode', 30)->default('single');
            $table->string('show_result_mode', 30)->default('after_release');
            $table->string('status', 30)->default('draft'); // draft | dijadwalkan | berlangsung | selesai | arsip
            $table->timestamps();

            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->foreign('parent_exam_id')->references('id')->on('exams')->onDelete('set null');
        });

        Schema::create('exam_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->uuid('question_id');
            $table->integer('sort_order')->default(0);
            $table->decimal('weight_override', 5, 2)->nullable();
            $table->string('package_code', 20)->nullable(); // A, B
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('restrict');
            $table->unique(['exam_id', 'question_id', 'package_code']);
        });

        Schema::create('exam_rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->uuid('room_id');
            $table->uuid('proctor_id')->nullable();
            $table->integer('session_no')->default(1);
            $table->string('token', 20);
            $table->timestamp('token_expires_at')->nullable();
            $table->timestamps();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('restrict');
            $table->foreign('proctor_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('exam_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->uuid('student_id');
            $table->uuid('exam_room_id');
            $table->string('package_code', 20)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('exam_room_id')->references('id')->on('exam_rooms')->onDelete('restrict');
            $table->unique(['exam_id', 'student_id']);
        });

        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->uuid('student_id');
            $table->string('status', 30)->default('belum'); // belum | mengerjakan | selesai | terkunci
            $table->timestamp('started_at')->nullable();
            $table->timestamp('deadline_at')->nullable(); // Waktu server mutlak
            $table->timestamp('submitted_at')->nullable();
            $table->integer('extra_minutes')->default(0);
            $table->string('seed', 50); // Acakan seed tetap
            $table->decimal('score', 5, 2)->nullable();
            $table->string('locked_reason', 255)->nullable();
            $table->timestamps();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->unique(['exam_id', 'student_id']);
            $table->index(['exam_id', 'status']);
        });

        Schema::create('exam_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->uuid('question_id');
            $table->jsonb('answer')->nullable();
            $table->boolean('is_flagged')->default(false); // Ragu-ragu
            $table->decimal('score', 5, 2)->nullable();
            $table->uuid('graded_by')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('restrict');
            $table->foreign('graded_by')->references('id')->on('users')->onDelete('set null');
            $table->unique(['session_id', 'question_id']);
        });

        Schema::create('exam_violations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id')->index();
            $table->string('violation_type', 100); // blur | tab_switch | background
            $table->jsonb('meta')->nullable();
            $table->timestamp('occurred_at')->useCurrent();

            $table->foreign('session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
        });

        Schema::create('exam_proctor_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id')->index();
            $table->uuid('actor_id');
            $table->string('action', 50); // reset | extra_time | force_submit | unlock
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('exam_item_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->uuid('question_id');
            $table->decimal('difficulty_index', 5, 3)->nullable();
            $table->decimal('discrimination_index', 5, 3)->nullable();
            $table->jsonb('distractor_stats')->nullable();
            $table->timestamp('calculated_at')->useCurrent();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
            $table->unique(['exam_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_item_analysis');
        Schema::dropIfExists('exam_proctor_actions');
        Schema::dropIfExists('exam_violations');
        Schema::dropIfExists('exam_answers');
        Schema::dropIfExists('exam_sessions');
        Schema::dropIfExists('exam_participants');
        Schema::dropIfExists('exam_rooms');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('question_banks');
    }
};
