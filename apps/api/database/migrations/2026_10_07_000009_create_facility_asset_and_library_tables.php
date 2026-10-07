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
        Schema::create('facilities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('room_id')->nullable();
            $table->string('name', 150);
            $table->string('facility_type', 30)->default('ruang'); // ruang | alat
            $table->integer('capacity')->nullable();
            $table->boolean('requires_approval')->default(true);
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('facility_id');
            $table->uuid('requested_by');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->text('purpose');
            $table->string('status', 30)->default('diajukan'); // diajukan | disetujui | ditolak | selesai
            $table->uuid('decided_by')->nullable();
            $table->timestamps();

            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('restrict');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('decided_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['facility_id', 'start_at', 'end_at']);
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('room_id')->nullable();
            $table->string('asset_code', 100)->unique(); // QR / Barcode
            $table->string('name', 200);
            $table->string('category', 100);
            $table->string('asset_condition', 30)->default('baik'); // baik | rusak_ringan | rusak_berat
            $table->date('acquired_at')->nullable();
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
        });

        Schema::create('asset_audits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 200);
            $table->date('audit_date');
            $table->uuid('auditor_id');
            $table->string('status', 50)->default('selesai');
            $table->timestamps();

            $table->foreign('auditor_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('asset_audit_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('audit_id');
            $table->uuid('asset_id');
            $table->string('found_condition', 50);
            $table->boolean('is_present')->default(true);
            $table->timestamps();

            $table->foreign('audit_id')->references('id')->on('asset_audits')->onDelete('cascade');
            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('cascade');
            $table->unique(['audit_id', 'asset_id']);
        });

        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('reporter_id');
            $table->uuid('room_id')->nullable();
            $table->uuid('asset_id')->nullable();
            $table->uuid('assignee_id')->nullable();
            $table->text('description');
            $table->string('priority', 30)->default('sedang'); // rendah | sedang | tinggi | darurat
            $table->string('status', 30)->default('pending'); // pending | diproses | selesai
            $table->uuid('photo_file_id')->nullable();
            $table->timestamps();

            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('set null');
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('photo_file_id')->references('id')->on('files')->onDelete('set null');
            $table->index('status');
        });

        Schema::create('ticket_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_id')->index();
            $table->uuid('actor_id');
            $table->string('event_type', 50); // disposisi | proses | selesai | komentar
            $table->text('note')->nullable();
            $table->uuid('file_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('library_books', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 255);
            $table->string('author', 200);
            $table->string('isbn', 50)->nullable();
            $table->string('book_type', 30)->default('fisik'); // fisik | digital
            $table->integer('stock')->default(1);
            $table->uuid('file_id')->nullable(); // E-book jika digital
            $table->timestamps();

            $table->foreign('file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('loans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('book_id');
            $table->uuid('borrower_id');
            $table->date('loan_date');
            $table->date('due_date');
            $table->date('returned_at')->nullable();
            $table->integer('fine_amount')->default(0); // Satuan Rupiah (integer)
            $table->timestamps();

            $table->foreign('book_id')->references('id')->on('library_books')->onDelete('restrict');
            $table->foreign('borrower_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('lab_equipment', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('room_id');
            $table->string('name', 200);
            $table->integer('stock')->default(1);
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('restrict');
        });

        Schema::create('lab_loans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('equipment_id');
            $table->uuid('borrower_id');
            $table->date('loan_date');
            $table->date('returned_at')->nullable();
            $table->timestamps();

            $table->foreign('equipment_id')->references('id')->on('lab_equipment')->onDelete('restrict');
            $table->foreign('borrower_id')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_loans');
        Schema::dropIfExists('lab_equipment');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('library_books');
        Schema::dropIfExists('ticket_events');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('asset_audit_items');
        Schema::dropIfExists('asset_audits');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('facilities');
    }
};
