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
        Schema::create('ppdb_waves', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('name', 150);
            $table->timestamp('open_at');
            $table->timestamp('close_at');
            $table->timestamp('result_publish_at');
            $table->string('status', 30)->default('draft'); // draft | aktif | ditutup | selesai
            $table->timestamps();
        });

        Schema::create('ppdb_tracks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('wave_id');
            $table->string('code', 50); // zonasi | prestasi | afirmasi
            $table->string('name', 100);
            $table->integer('quota');
            $table->jsonb('score_formula')->nullable();
            $table->timestamps();

            $table->foreign('wave_id')->references('id')->on('ppdb_waves')->onDelete('cascade');
            $table->unique(['wave_id', 'code']);
        });

        Schema::create('ppdb_requirements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('track_id');
            $table->string('document_type', 100); // KK | Akta | Rapor | Sertifikat
            $table->boolean('is_required')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('track_id')->references('id')->on('ppdb_tracks')->onDelete('cascade');
        });

        Schema::create('applicants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('wave_id');
            $table->uuid('track_id');
            $table->uuid('user_id')->nullable()->index();
            $table->uuid('student_id')->nullable()->unique(); // Idempoten konversi
            $table->string('registration_no', 50)->unique();
            $table->string('nik_enc', 255); // Enkripsi at-rest
            $table->string('full_name', 200);
            $table->date('birth_date');
            $table->string('status', 50)->default('draft'); // draft|submitted|verified|revision|selected|waitlist|rejected|enrolled
            $table->decimal('score', 6, 2)->nullable();
            $table->integer('rank')->nullable();
            $table->string('decision', 50)->nullable(); // diterima | cadangan | ditolak
            $table->jsonb('step_data')->nullable(); // Autosave formulir bertahap
            $table->timestamps();

            $table->foreign('wave_id')->references('id')->on('ppdb_waves')->onDelete('restrict');
            $table->foreign('track_id')->references('id')->on('ppdb_tracks')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('set null');

            $table->index(['wave_id', 'status']);
            $table->index(['track_id', 'rank']);
        });

        Schema::create('applicant_parents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('applicant_id')->index();
            $table->string('parent_type', 30); // ayah | ibu | wali
            $table->string('name', 200);
            $table->string('occupation', 100)->nullable();
            $table->string('income_range', 100)->nullable();
            $table->string('phone', 30)->nullable();
            $table->timestamps();

            $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
        });

        Schema::create('applicant_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('applicant_id')->index();
            $table->uuid('file_id');
            $table->string('document_type', 100);
            $table->string('status', 30)->default('menunggu'); // menunggu | valid | ditolak
            $table->text('reject_reason')->nullable();
            $table->uuid('verified_by')->nullable();
            $table->timestamps();

            $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('restrict');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('applicant_status_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('applicant_id')->index();
            $table->string('from_status', 50);
            $table->string('to_status', 50);
            $table->text('note')->nullable();
            $table->uuid('actor_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('ppdb_re_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('applicant_id')->unique();
            $table->timestamp('confirmed_at')->nullable();
            $table->string('status', 50)->default('menunggu');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppdb_re_registrations');
        Schema::dropIfExists('applicant_status_history');
        Schema::dropIfExists('applicant_documents');
        Schema::dropIfExists('applicant_parents');
        Schema::dropIfExists('applicants');
        Schema::dropIfExists('ppdb_requirements');
        Schema::dropIfExists('ppdb_tracks');
        Schema::dropIfExists('ppdb_waves');
    }
};
