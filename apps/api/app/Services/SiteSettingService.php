<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SiteSettingService
{
    /**
     * BE-CMS-01: Get compiled public site profile with robust fallbacks.
     */
    public function getSiteProfile(): array
    {
        $defaults = $this->getDefaults();
        $stored = SiteSetting::all()->pluck('setting_value', 'setting_key')->toArray();

        $profile = [];
        foreach ($defaults as $section => $defaultValues) {
            $storedSection = $stored[$section] ?? [];
            if (is_array($defaultValues)) {
                $profile[$section] = array_merge($defaultValues, $storedSection);
            } else {
                $profile[$section] = $storedSection ?: $defaultValues;
            }
        }

        return $profile;
    }

    /**
     * BE-CMS-01: Update site settings and log audit trail.
     */
    public function updateSiteSettings(array $data, Request $request): array
    {
        return DB::transaction(function () use ($data, $request) {
            $updatedKeys = [];
            $oldValues = [];

            foreach (['identity', 'contact', 'address', 'social_media', 'profile'] as $section) {
                if (array_key_exists($section, $data) && is_array($data[$section])) {
                    $setting = SiteSetting::where('setting_key', $section)->first();
                    $existing = $setting?->setting_value ?? ($this->getDefaults()[$section] ?? []);

                    $oldValues[$section] = $existing;
                    $merged = array_merge($existing, $data[$section]);

                    SiteSetting::updateOrCreate(
                        ['setting_key' => $section],
                        [
                            'school_id' => $request->user()?->school_id,
                            'setting_value' => $merged,
                        ]
                    );

                    $updatedKeys[] = $section;
                }
            }

            $currentProfile = $this->getSiteProfile();

            $this->logAudit(
                $request->user()?->id,
                'site_settings.updated',
                'SiteSetting',
                null,
                $oldValues,
                ['updated_sections' => $updatedKeys],
                $request
            );

            return $currentProfile;
        });
    }

    /**
     * BE-CMS-01: Default site profile data fallback.
     */
    public function getDefaults(): array
    {
        return [
            'identity' => [
                'name' => 'SMA Labschool UM',
                'tagline' => 'Membangun Karakter Cerdas, Islami, dan Berdaya Saing Global',
                'logo_url' => null,
                'favicon_url' => null,
            ],
            'contact' => [
                'phone' => '(0341) 551312',
                'email' => 'info@labschool.sch.id',
                'whatsapp' => '081234567890',
            ],
            'address' => [
                'street' => 'Jl. Surabaya No. 6',
                'city' => 'Kota Malang',
                'postal_code' => '65145',
                'latitude' => -7.9622,
                'longitude' => 112.6173,
                'maps_embed_url' => null,
            ],
            'social_media' => [
                'instagram' => null,
                'youtube' => null,
                'facebook' => null,
                'twitter' => null,
                'tiktok' => null,
            ],
            'profile' => [
                'vision' => 'Menjadi sekolah rujukan berstandar nasional dan global berlandaskan nilai-nilai luhur dan inovasi.',
                'mission' => [
                    'Menyelenggarakan pendidikan berkualitas yang mengembangkan potensi kecerdasan intelektual, emosional, dan spiritual.',
                    'Membina budaya riset, teknologi, dan kewirausahaan sejak dini.',
                    'Menanamkan karakter berwawasan kebangsaan dan kepedulian lingkungan hidup.',
                ],
                'principal_greeting' => [
                    'principal_name' => 'Dr. Hj. Siti Fatimah, M.Pd.',
                    'principal_photo_url' => null,
                    'greeting_text' => 'Selamat datang di Portal Resmi Portal Sekolah Satu Pintu SMA Labschool UM.',
                ],
                'accreditation' => [
                    'grade' => 'A',
                    'score' => 96,
                    'certificate_no' => 'BAN-S/M-12345/2022',
                    'valid_until' => '2027-12-31',
                ],
                'featured_programs' => [
                    [
                        'title' => 'Bilingual Science & Tech',
                        'description' => 'Kurikulum pengantar dwibahasa untuk peminatan MIPA dan teknologi digital.',
                        'icon' => 'laptop',
                    ],
                    [
                        'title' => 'Tahfidz & Karakter Qur\'ani',
                        'description' => 'Bimbingan hafalan Al-Qur\'an dan integrasi adab dalam kehidupan sekolah.',
                        'icon' => 'book-open',
                    ],
                    [
                        'title' => 'Riset Siswa & Inkubasi Karya',
                        'description' => 'Program penelitian karya ilmiah remaja dan kompetisi nasional/internasional.',
                        'icon' => 'award',
                    ],
                ],
            ],
        ];
    }

    /**
     * Helper to write an audit log entry.
     */
    protected function logAudit(
        ?string $actorId,
        string $action,
        string $entity,
        ?string $entityId,
        ?array $oldValue,
        ?array $newValue,
        Request $request
    ): void {
        try {
            AuditLog::create([
                'actor_id' => $actorId,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId,
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
