<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'notif_type',
        'channel_push',
        'channel_wa',
        'channel_email',
        'is_enabled',
    ];

    protected $casts = [
        'channel_push' => 'boolean',
        'channel_wa' => 'boolean',
        'channel_email' => 'boolean',
        'is_enabled' => 'boolean',
    ];

    public const NOTIFICATION_TYPES = [
        'academic_announcement' => [
            'label' => 'Pengumuman & Kegiatan Akademik',
            'description' => 'Notifikasi terkait jadwal ujian, kegiatan sekolah, dan kalender akademik.',
            'supported_channels' => ['push', 'wa', 'email'],
        ],
        'grade_report' => [
            'label' => 'Penerbitan Nilai & Rapor Siswa',
            'description' => 'Pemberitahuan ketika rapor atau nilai asesmen siswa telah diterbitkan.',
            'supported_channels' => ['push', 'wa', 'email'],
        ],
        'attendance_alert' => [
            'label' => 'Presensi & Kehadiran',
            'description' => 'Pemberitahuan ketidakhadiran, dispensasi, atau keterlambatan siswa/staf.',
            'supported_channels' => ['push', 'wa'],
        ],
        'payment_reminder' => [
            'label' => 'Tagihan & Pengingat SPP',
            'description' => 'Pengingat jatuh tempo pembayaran SPP dan biaya pendidikan.',
            'supported_channels' => ['wa', 'email'],
        ],
        'counseling_update' => [
            'label' => 'Bimbingan & Konseling (BK)',
            'description' => 'Pemberitahuan perubahan status janji temu konseling siswa.',
            'supported_channels' => ['push', 'email'],
        ],
        'system_alert' => [
            'label' => 'Pemberitahuan Akun & Sistem',
            'description' => 'Informasi pembaruan keamanan akun, login baru, dan pemeliharaan portal.',
            'supported_channels' => ['push', 'email'],
        ],
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
