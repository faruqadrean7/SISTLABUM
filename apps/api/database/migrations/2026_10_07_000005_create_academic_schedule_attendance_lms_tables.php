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
        Schema::create('time_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('name', 50); // Jam ke-1, Jam ke-2
            $table->string('start_time', 10); // HH:mm
            $table->string('end_time', 10); // HH:mm
            $table->string('day_type', 30)->default('reguler');
            $table->timestamps();
        });

        Schema::create('schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('semester_id');
            $table->uuid('class_id');
            $table->uuid('subject_id');
            $table->uuid('teacher_id');
            $table->uuid('room_id')->nullable();
            $table->uuid('time_slot_id');
            $table->integer('day_of_week'); // 1: Senin s.d. 7: Minggu
            $table->timestamps();

            $table->foreign('semester_id')->references('id')->on('semesters')->onDelete('restrict');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('restrict');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('restrict');
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('restrict');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            $table->foreign('time_slot_id')->references('id')->on('time_slots')->onDelete('restrict');

            $table->unique(['semester_id', 'class_id', 'day_of_week', 'time_slot_id']);
            $table->index(['teacher_id', 'day_of_week', 'time_slot_id']);
            $table->index(['room_id', 'day_of_week', 'time_slot_id']);
        });

        Schema::create('journals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('schedule_id');
            $table->uuid('teacher_id');
            $table->date('session_date');
            $table->string('topic', 255);
            $table->string('method', 150);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('schedule_id')->references('id')->on('schedules')->onDelete('restrict');
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('restrict');
            $table->index(['schedule_id', 'session_date']);
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('journal_id')->nullable()->index();
            $table->uuid('student_id')->index();
            $table->date('att_date')->index();
            $table->string('status', 30)->default('hadir'); // hadir | izin | sakit | alpa | terlambat
            $table->string('source', 30)->default('kelas'); // kelas | gerbang
            $table->string('note', 255)->nullable();
            $table->uuid('recorded_by')->nullable();
            $table->timestamps();

            $table->foreign('journal_id')->references('id')->on('journals')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('restrict');
            $table->foreign('recorded_by')->references('id')->on('users')->onDelete('set null');

            $table->unique(['journal_id', 'student_id']);
            $table->index(['student_id', 'att_date']);
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id')->index();
            $table->uuid('requested_by')->nullable();
            $table->string('leave_type', 30); // sakit | izin | dispen
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason');
            $table->uuid('attachment_file_id')->nullable();
            $table->string('status', 30)->default('menunggu'); // menunggu | disetujui | ditolak
            $table->uuid('decided_by')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('attachment_file_id')->references('id')->on('files')->onDelete('set null');
            $table->foreign('decided_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('staff_attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->date('att_date');
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('status', 30)->default('hadir');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'att_date']);
        });

        Schema::create('teaching_materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grade_level_id')->nullable();
            $table->uuid('subject_id')->nullable();
            $table->uuid('uploaded_by');
            $table->uuid('file_id');
            $table->string('material_type', 50); // modul | ATP | silabus | P5
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->foreign('grade_level_id')->references('id')->on('grade_levels')->onDelete('set null');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('set null');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('restrict');
        });

        Schema::create('learning_materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('class_id');
            $table->uuid('subject_id');
            $table->uuid('teacher_id');
            $table->string('title', 200);
            $table->uuid('file_id')->nullable();
            $table->timestamps();

            $table->foreign('class_id')->references('id')->on('classes')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('restrict');
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('restrict');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('class_id');
            $table->uuid('subject_id');
            $table->uuid('teacher_id');
            $table->string('title', 200);
            $table->timestamp('due_at');
            $table->timestamps();

            $table->foreign('class_id')->references('id')->on('classes')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('restrict');
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('restrict');
        });

        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('assignment_id');
            $table->uuid('student_id');
            $table->uuid('file_id')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->foreign('assignment_id')->references('id')->on('assignments')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('set null');
            $table->unique(['assignment_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('learning_materials');
        Schema::dropIfExists('teaching_materials');
        Schema::dropIfExists('staff_attendances');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('journals');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('time_slots');
    }
};
