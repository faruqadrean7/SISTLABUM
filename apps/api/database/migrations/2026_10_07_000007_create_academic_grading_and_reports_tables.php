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
        Schema::create('grade_components', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('subject_id');
            $table->uuid('semester_id');
            $table->uuid('class_id')->nullable();
            $table->string('code', 50); // UH, UTS, UAS, TUGAS
            $table->string('name', 100);
            $table->decimal('weight', 5, 2)->default(1.0);
            $table->timestamps();

            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('restrict');
            $table->foreign('semester_id')->references('id')->on('semesters')->onDelete('restrict');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('set null');
            $table->unique(['subject_id', 'semester_id', 'class_id', 'code']);
        });

        Schema::create('grade_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('semester_id');
            $table->integer('month'); // 1 - 12
            $table->string('status', 30)->default('open'); // open | locked
            $table->uuid('locked_by')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->foreign('semester_id')->references('id')->on('semesters')->onDelete('restrict');
            $table->foreign('locked_by')->references('id')->on('users')->onDelete('set null');
            $table->unique(['semester_id', 'month']);
        });

        Schema::create('grades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('component_id');
            $table->uuid('period_id');
            $table->uuid('exam_id')->nullable(); // Kaitan nilai otomatis CBT
            $table->decimal('value', 5, 2); // 0 - 100
            $table->string('source', 30)->default('manual'); // manual | cbt
            $table->uuid('entered_by')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('component_id')->references('id')->on('grade_components')->onDelete('restrict');
            $table->foreign('period_id')->references('id')->on('grade_periods')->onDelete('restrict');
            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('set null');
            $table->foreign('entered_by')->references('id')->on('users')->onDelete('set null');

            $table->unique(['student_id', 'component_id', 'period_id']);
            $table->index(['student_id', 'period_id']);
        });

        Schema::create('character_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('period_id');
            $table->jsonb('scale_data'); // Pembiasaan profil pelajar
            $table->text('homeroom_note')->nullable();
            $table->uuid('author_id');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('period_id')->references('id')->on('grade_periods')->onDelete('restrict');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('restrict');
            $table->unique(['student_id', 'period_id']);
        });

        Schema::create('progress_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('period_id');
            $table->jsonb('data_snapshot'); // Membekukan nilai saat disahkan
            $table->uuid('file_id')->nullable();
            $table->string('status', 30)->default('draft'); // draft | menunggu_acc | disetujui | terbit
            $table->uuid('approved_by')->nullable();
            $table->string('verify_token', 100)->unique(); // Verifikasi QR publik
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('period_id')->references('id')->on('grade_periods')->onDelete('restrict');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->unique(['student_id', 'period_id']);
        });

        Schema::create('report_cards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('semester_id');
            $table->jsonb('data_snapshot'); // Nilai semesteran beku
            $table->uuid('file_id')->nullable();
            $table->string('status', 30)->default('draft');
            $table->timestamp('locked_at')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->string('verify_token', 100)->unique();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('semester_id')->references('id')->on('semesters')->onDelete('restrict');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->unique(['student_id', 'semester_id']);
        });

        Schema::create('report_description_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('subject_id');
            $table->string('level', 30); // tuntas | belum
            $table->text('template_text');
            $table->timestamps();

            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_description_templates');
        Schema::dropIfExists('report_cards');
        Schema::dropIfExists('progress_reports');
        Schema::dropIfExists('character_notes');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('grade_periods');
        Schema::dropIfExists('grade_components');
    }
};
