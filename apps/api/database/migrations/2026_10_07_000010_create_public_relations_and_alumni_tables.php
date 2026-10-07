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
        Schema::create('guests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('target_user_id')->nullable();
            $table->string('full_name', 200);
            $table->string('institution', 150)->nullable();
            $table->string('phone', 30);
            $table->text('purpose');
            $table->uuid('photo_file_id')->nullable();
            $table->timestamp('check_in')->useCurrent();
            $table->timestamp('check_out')->nullable();
            $table->timestamps();

            $table->foreign('target_user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('photo_file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('complaints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('reporter_user_id')->nullable(); // NULL jika anonim
            $table->string('ticket_code', 50)->unique(); // Kode pelacakan publik
            $table->string('category', 100);
            $table->text('content');
            $table->boolean('is_anonymous')->default(false);
            $table->string('status', 50)->default('baru'); // baru | ditinjau | ditindaklanjuti | selesai
            $table->uuid('assigned_to')->nullable();
            $table->timestamps();

            $table->foreign('reporter_user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('complaint_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('complaint_id')->index();
            $table->uuid('actor_id')->nullable();
            $table->string('event_type', 50);
            $table->text('response_text');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('complaint_id')->references('id')->on('complaints')->onDelete('cascade');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('partnerships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('partner_name', 200);
            $table->text('scope');
            $table->date('valid_from');
            $table->date('valid_until');
            $table->uuid('mou_file_id')->nullable();
            $table->timestamps();

            $table->foreign('mou_file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('exchange_programs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('partnership_id');
            $table->string('name', 200);
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();

            $table->foreign('partnership_id')->references('id')->on('partnerships')->onDelete('cascade');
        });

        Schema::create('exchange_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('program_id');
            $table->uuid('student_id');
            $table->string('status', 50)->default('aktif');
            $table->timestamps();

            $table->foreign('program_id')->references('id')->on('exchange_programs')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->unique(['program_id', 'student_id']);
        });

        Schema::create('alumni', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id')->unique();
            $table->integer('graduation_year');
            $table->string('next_institution', 200)->nullable();
            $table->string('occupation', 150)->nullable();
            $table->string('contact', 100)->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
        });

        Schema::create('tracer_surveys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 200);
            $table->jsonb('questions');
            $table->timestamps();
        });

        Schema::create('tracer_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('survey_id');
            $table->uuid('alumni_id');
            $table->jsonb('answers');
            $table->timestamps();

            $table->foreign('survey_id')->references('id')->on('tracer_surveys')->onDelete('cascade');
            $table->foreign('alumni_id')->references('id')->on('alumni')->onDelete('cascade');
            $table->unique(['survey_id', 'alumni_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracer_responses');
        Schema::dropIfExists('tracer_surveys');
        Schema::dropIfExists('alumni');
        Schema::dropIfExists('exchange_participants');
        Schema::dropIfExists('exchange_programs');
        Schema::dropIfExists('partnerships');
        Schema::dropIfExists('complaint_events');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('guests');
    }
};
