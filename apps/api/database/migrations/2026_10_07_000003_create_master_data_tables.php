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
        Schema::create('academic_years', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('name', 50)->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('semesters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('academic_year_id');
            $table->string('name', 50);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('academic_year_id')->references('id')->on('academic_years')->onDelete('restrict');
            $table->unique(['academic_year_id', 'name']);
        });

        Schema::create('grade_levels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('name', 50);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('majors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('name', 100);
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('code', 50)->unique();
            $table->string('name', 150);
            $table->string('room_type', 50);
            $table->integer('capacity')->default(40);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('code', 30)->unique();
            $table->string('name', 150);
            $table->string('subject_group', 50);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('teachers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->unique();
            $table->string('nip', 50)->nullable()->unique();
            $table->string('nuptk', 50)->nullable()->unique();
            $table->string('full_name', 200);
            $table->string('position', 100)->nullable();
            $table->string('status', 50)->default('tetap');
            $table->uuid('photo_file_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('photo_file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('staff', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->unique();
            $table->string('full_name', 200);
            $table->string('position', 100)->nullable();
            $table->string('unit', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('guardians', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->unique();
            $table->string('full_name', 200);
            $table->string('phone', 30);
            $table->string('occupation', 100)->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->unique();
            $table->string('nis', 30)->unique();
            $table->string('nisn', 30)->unique();
            $table->string('nik_enc', 255); // Enkripsi at-rest
            $table->string('full_name', 200);
            $table->string('gender', 10); // L | P
            $table->string('birth_place', 100);
            $table->date('birth_date');
            $table->string('religion', 50)->nullable();
            $table->text('address')->nullable();
            $table->uuid('photo_file_id')->nullable();
            $table->string('status', 50)->default('aktif'); // aktif | lulus | pindah | keluar
            $table->date('entry_date');
            $table->date('graduated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('photo_file_id')->references('id')->on('files')->onDelete('set null');
            $table->index('status');
        });

        Schema::create('student_status_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id')->index();
            $table->string('status', 50);
            $table->text('reason')->nullable();
            $table->date('effective_date');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
        });

        Schema::create('student_guardians', function (Blueprint $table) {
            $table->uuid('student_id');
            $table->uuid('guardian_id');
            $table->string('relationship', 50); // ayah | ibu | wali
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->primary(['student_id', 'guardian_id']);
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('guardian_id')->references('id')->on('guardians')->onDelete('cascade');
        });

        Schema::create('classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('academic_year_id');
            $table->uuid('grade_level_id');
            $table->uuid('major_id')->nullable();
            $table->uuid('homeroom_teacher_id')->nullable()->index();
            $table->string('name', 100);
            $table->integer('capacity')->default(36);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('academic_year_id')->references('id')->on('academic_years')->onDelete('restrict');
            $table->foreign('grade_level_id')->references('id')->on('grade_levels')->onDelete('restrict');
            $table->foreign('major_id')->references('id')->on('majors')->onDelete('set null');
            $table->foreign('homeroom_teacher_id')->references('id')->on('teachers')->onDelete('set null');
            $table->unique(['academic_year_id', 'name']);
        });

        Schema::create('class_students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('class_id');
            $table->uuid('student_id')->index();
            $table->date('joined_at');
            $table->date('left_at')->nullable();
            $table->timestamps();

            $table->foreign('class_id')->references('id')->on('classes')->onDelete('restrict');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('restrict');
            $table->unique(['class_id', 'student_id']);
        });

        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('semester_id');
            $table->uuid('class_id');
            $table->uuid('subject_id');
            $table->uuid('teacher_id')->index();
            $table->integer('hours_per_week')->default(2);
            $table->timestamps();

            $table->foreign('semester_id')->references('id')->on('semesters')->onDelete('restrict');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('restrict');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('restrict');
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('restrict');
            $table->unique(['semester_id', 'class_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_assignments');
        Schema::dropIfExists('class_students');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('student_guardians');
        Schema::dropIfExists('student_status_history');
        Schema::dropIfExists('students');
        Schema::dropIfExists('guardians');
        Schema::dropIfExists('staff');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('majors');
        Schema::dropIfExists('grade_levels');
        Schema::dropIfExists('semesters');
        Schema::dropIfExists('academic_years');
    }
};
