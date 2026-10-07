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
        Schema::create('point_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('kind', 30); // pelanggaran | prestasi
            $table->string('name', 200);
            $table->integer('points');
            $table->string('severity', 20)->default('rendah'); // rendah | sedang | tinggi | berat
            $table->timestamps();
        });

        Schema::create('student_points', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id')->index();
            $table->uuid('point_type_id');
            $table->uuid('recorded_by');
            $table->uuid('evidence_file_id')->nullable();
            $table->date('point_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('point_type_id')->references('id')->on('point_types')->onDelete('restrict');
            $table->foreign('recorded_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('evidence_file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('point_thresholds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->integer('min_points');
            $table->string('action', 200); // Peringatan 1, Panggilan Ortu, Skorsing
            $table->jsonb('notify_roles');
            $table->timestamps();
        });

        Schema::create('extracurriculars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('coach_id')->nullable();
            $table->string('name', 150);
            $table->integer('quota')->default(30);
            $table->timestamps();

            $table->foreign('coach_id')->references('id')->on('teachers')->onDelete('set null');
        });

        Schema::create('extracurricular_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('extracurricular_id');
            $table->uuid('student_id');
            $table->string('status', 30)->default('aktif'); // aktif | nonaktif | keluar
            $table->string('final_grade', 10)->nullable(); // Nilai rapor (A, B, C)
            $table->timestamps();

            $table->foreign('extracurricular_id')->references('id')->on('extracurriculars')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->unique(['extracurricular_id', 'student_id']);
        });

        Schema::create('extracurricular_journals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('extracurricular_id');
            $table->date('session_date');
            $table->text('activity');
            $table->jsonb('attendance')->nullable();
            $table->timestamps();

            $table->foreign('extracurricular_id')->references('id')->on('extracurriculars')->onDelete('cascade');
        });

        Schema::create('activity_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('extracurricular_id');
            $table->uuid('file_id');
            $table->string('doc_type', 30); // proposal | laporan
            $table->timestamps();

            $table->foreign('extracurricular_id')->references('id')->on('extracurriculars')->onDelete('cascade');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('restrict');
        });

        Schema::create('competitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('name', 200);
            $table->string('level', 50); // Kota, Provinsi, Nasional, Internasional
            $table->date('held_at');
            $table->timestamps();
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->string('title', 200);
            $table->string('rank_level', 100);
            $table->date('achieved_at');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
        });

        Schema::create('competition_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('competition_id');
            $table->uuid('student_id');
            $table->string('result', 100)->nullable();
            $table->uuid('achievement_id')->nullable();
            $table->timestamps();

            $table->foreign('competition_id')->references('id')->on('competitions')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('achievement_id')->references('id')->on('achievements')->onDelete('set null');
        });

        Schema::create('trips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 200);
            $table->date('depart_date');
            $table->jsonb('route')->nullable();
            $table->uuid('guide_file_id')->nullable();
            $table->timestamps();

            $table->foreign('guide_file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('trip_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('trip_id');
            $table->uuid('student_id');
            $table->timestamps();

            $table->foreign('trip_id')->references('id')->on('trips')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->unique(['trip_id', 'student_id']);
        });

        Schema::create('trip_consents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('trip_participant_id')->unique();
            $table->uuid('guardian_id');
            $table->string('decision', 30); // setuju | tolak
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->foreign('trip_participant_id')->references('id')->on('trip_participants')->onDelete('cascade');
            $table->foreign('guardian_id')->references('id')->on('guardians')->onDelete('restrict');
        });

        // Bimbingan & Konseling (BK)
        Schema::create('counseling_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id')->index();
            $table->uuid('counselor_id');
            $table->string('category', 100); // Pribadi, Sosial, Belajar, Karir
            $table->string('status', 50)->default('aktif');
            $table->text('summary_enc'); // Enkripsi at-rest
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('counselor_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('counseling_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('case_id')->index();
            $table->date('session_date');
            $table->text('notes_enc'); // Enkripsi at-rest
            $table->text('follow_up')->nullable();
            $table->timestamps();

            $table->foreign('case_id')->references('id')->on('counseling_cases')->onDelete('cascade');
        });

        Schema::create('counseling_referrals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('referred_by');
            $table->text('reason');
            $table->string('status', 50)->default('pending');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('referred_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('counseling_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('requested_by');
            $table->string('topic', 200);
            $table->string('status', 50)->default('pending');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('early_warnings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id')->index();
            $table->string('rule_code', 100);
            $table->string('severity', 20)->default('sedang');
            $table->jsonb('data')->nullable();
            $table->string('status', 50)->default('open');
            $table->uuid('handled_by')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('handled_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('early_warnings');
        Schema::dropIfExists('counseling_requests');
        Schema::dropIfExists('counseling_referrals');
        Schema::dropIfExists('counseling_sessions');
        Schema::dropIfExists('counseling_cases');
        Schema::dropIfExists('trip_consents');
        Schema::dropIfExists('trip_participants');
        Schema::dropIfExists('trips');
        Schema::dropIfExists('competition_entries');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('competitions');
        Schema::dropIfExists('activity_documents');
        Schema::dropIfExists('extracurricular_journals');
        Schema::dropIfExists('extracurricular_members');
        Schema::dropIfExists('extracurriculars');
        Schema::dropIfExists('point_thresholds');
        Schema::dropIfExists('student_points');
        Schema::dropIfExists('point_types');
    }
};
