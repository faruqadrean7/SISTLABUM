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
        Schema::create('post_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('category_id')->nullable();
            $table->uuid('author_id');
            $table->uuid('cover_file_id')->nullable();
            $table->string('slug', 255)->unique();
            $table->string('title', 255);
            $table->text('content');
            $table->string('status', 30)->default('draft'); // draft | terbit | arsip
            $table->string('visibility', 30)->default('publik'); // publik | internal
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('post_categories')->onDelete('set null');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('cover_file_id')->references('id')->on('files')->onDelete('set null');
            $table->index(['status', 'published_at']);
        });

        Schema::create('albums', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 200);
            $table->uuid('cover_file_id')->nullable();
            $table->timestamps();

            $table->foreign('cover_file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('media_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('album_id');
            $table->uuid('file_id');
            $table->string('media_type', 30); // image | video
            $table->string('caption', 255)->nullable();
            $table->timestamps();

            $table->foreign('album_id')->references('id')->on('albums')->onDelete('cascade');
            $table->foreign('file_id')->references('id')->on('files')->onDelete('restrict');
        });

        Schema::create('bulletins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 200);
            $table->uuid('file_id'); // PDF majalah / buletin
            $table->uuid('cover_file_id')->nullable();
            $table->timestamps();

            $table->foreign('file_id')->references('id')->on('files')->onDelete('restrict');
            $table->foreign('cover_file_id')->references('id')->on('files')->onDelete('set null');
        });

        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 200);
            $table->string('category', 50); // ujian | libur | event
            $table->string('visibility', 30)->default('publik'); // publik | internal
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->timestamps();

            $table->index(['start_at', 'end_at']);
        });

        Schema::create('downloads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('title', 200);
            $table->string('category', 100);
            $table->string('visibility', 30)->default('publik');
            $table->uuid('file_id');
            $table->timestamps();

            $table->foreign('file_id')->references('id')->on('files')->onDelete('restrict');
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('setting_key', 100)->unique();
            $table->jsonb('setting_value');
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index();
            $table->string('notif_type', 50);
            $table->string('title', 200);
            $table->text('body');
            $table->jsonb('data')->nullable(); // Deep link payload
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'read_at', 'created_at']);
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('author_id');
            $table->string('title', 255);
            $table->text('body');
            $table->string('target_type', 30)->default('semua'); // semua | kelas | tingkat | role
            $table->jsonb('target_ids')->nullable();
            $table->timestamp('publish_at')->useCurrent();
            $table->timestamps();

            $table->foreign('author_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('announcement_reads', function (Blueprint $table) {
            $table->uuid('announcement_id');
            $table->uuid('user_id');
            $table->timestamp('read_at')->useCurrent();

            $table->primary(['announcement_id', 'user_id']);
            $table->foreign('announcement_id')->references('id')->on('announcements')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('notification_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->string('code', 100)->unique(); // RAPOR_TERBIT | IZIN_DISETUJUI
            $table->string('channel', 30); // push | wa | email
            $table->text('template_text');
            $table->timestamps();
        });

        Schema::create('notification_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->uuid('template_id')->nullable();
            $table->string('channel', 30);
            $table->string('status', 50); // sent | failed | queued
            $table->string('provider_ref', 255)->nullable();
            $table->text('error')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('template_id')->references('id')->on('notification_templates')->onDelete('set null');
            $table->index(['channel', 'status']);
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->uuid('requested_by')->nullable();
            $table->uuid('result_file_id')->nullable();
            $table->string('job_type', 100); // GENERATE_RAPOR_MASSAL | EXPORT_EXCEL
            $table->string('status', 30)->default('pending'); // pending | processing | completed | failed
            $table->integer('progress')->default(0); // 0-100
            $table->timestamps();

            $table->foreign('requested_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('result_file_id')->references('id')->on('files')->onDelete('set null');
            $table->index(['school_id', 'status']);
        });

        Schema::create('app_config', function (Blueprint $table) {
            $table->string('config_key', 100)->primary();
            $table->jsonb('config_value');
            $table->timestamp('updated_at')->useCurrent();
        });

        Schema::create('holidays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable()->index();
            $table->date('holiday_date');
            $table->string('name', 150);
            $table->timestamps();

            $table->unique(['school_id', 'holiday_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
        Schema::dropIfExists('app_config');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('announcement_reads');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('downloads');
        Schema::dropIfExists('events');
        Schema::dropIfExists('bulletins');
        Schema::dropIfExists('media_items');
        Schema::dropIfExists('albums');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('post_categories');
    }
};
