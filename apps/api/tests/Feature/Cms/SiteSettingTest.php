<?php

namespace Tests\Feature\Cms;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SiteSettingTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $regularUser;

    protected Role $adminRole;

    protected Role $guestRole;

    protected Permission $permManageSite;

    protected function setUp(): void
    {
        parent::setUp();

        // Permissions
        $this->permManageSite = Permission::create([
            'code' => 'cms.site.manage',
            'description' => 'Mengelola pengaturan situs dan profil sekolah',
        ]);

        // Roles
        $this->adminRole = Role::create([
            'code' => 'super_admin',
            'name' => 'Super Administrator',
            'is_system' => true,
        ]);
        $this->adminRole->permissions()->attach([$this->permManageSite->id]);

        $this->guestRole = Role::create([
            'code' => 'guest',
            'name' => 'Tamu',
            'is_system' => false,
        ]);

        // Users
        $this->adminUser = User::create([
            'username' => 'admin_humas',
            'email' => 'humas@labschool.sch.id',
            'password_hash' => Hash::make('AdminSecret123!'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->attach($this->adminRole->id);

        $this->regularUser = User::create([
            'username' => 'guest_user',
            'email' => 'guest@labschool.sch.id',
            'password_hash' => Hash::make('GuestSecret123!'),
            'status' => 'active',
        ]);
        $this->regularUser->roles()->attach($this->guestRole->id);
    }

    /**
     * BE-CMS-01: Public can get site profile without authentication
     */
    public function test_be_cms_01_public_can_get_site_profile_without_auth(): void
    {
        $response = $this->getJson('/api/v1/public/site');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'identity' => [
                        'name',
                        'tagline',
                        'logo_url',
                        'favicon_url',
                    ],
                    'contact' => [
                        'phone',
                        'email',
                        'whatsapp',
                    ],
                    'address' => [
                        'street',
                        'city',
                        'postal_code',
                        'latitude',
                        'longitude',
                        'maps_embed_url',
                    ],
                    'social_media' => [
                        'instagram',
                        'youtube',
                        'facebook',
                        'twitter',
                        'tiktok',
                    ],
                    'profile' => [
                        'vision',
                        'mission',
                        'principal_greeting' => [
                            'principal_name',
                            'principal_photo_url',
                            'greeting_text',
                        ],
                        'accreditation' => [
                            'grade',
                            'score',
                            'certificate_no',
                            'valid_until',
                        ],
                        'featured_programs',
                    ],
                ],
            ])
            ->assertJsonPath('data.identity.name', 'SMA Labschool UM');
    }

    /**
     * BE-CMS-01: Unauthenticated user cannot access or update admin site settings (401)
     */
    public function test_be_cms_01_unauthenticated_user_cannot_access_or_update_admin_site_settings(): void
    {
        $this->getJson('/api/v1/site-settings')
            ->assertStatus(401)
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');

        $this->putJson('/api/v1/site-settings', [
            'identity' => ['name' => 'Nama Baru'],
        ])
            ->assertStatus(401)
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }

    /**
     * BE-CMS-01: User without permission cannot access or update site settings (403)
     */
    public function test_be_cms_01_user_without_permission_cannot_access_or_update_site_settings(): void
    {
        $this->actingAs($this->regularUser)
            ->getJson('/api/v1/site-settings')
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');

        $this->actingAs($this->regularUser)
            ->putJson('/api/v1/site-settings', [
                'identity' => ['name' => 'Perubahan Ilegal'],
            ])
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }

    /**
     * BE-CMS-01: Validation fails on invalid URLs, emails, or coordinates (400 VALIDATION_FAILED)
     */
    public function test_be_cms_01_validation_fails_on_invalid_urls_or_emails(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson('/api/v1/site-settings', [
                'identity' => [
                    'logo_url' => 'not-a-valid-url',
                ],
                'contact' => [
                    'email' => 'invalid-email-address',
                ],
                'address' => [
                    'latitude' => 150.00, // Invalid: must be between -90 and 90
                ],
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('error.code', 'VALIDATION_FAILED');
    }

    /**
     * BE-CMS-01: Admin can update site settings and logs audit
     */
    public function test_be_cms_01_admin_can_update_site_settings_and_logs_audit(): void
    {
        $payload = [
            'identity' => [
                'name' => 'SMA Labschool Universitas Negeri Malang',
                'tagline' => 'Sekolah Berwawasan Global dan Berkarakter Juara',
                'logo_url' => 'https://cdn.labschool.sch.id/logo.png',
                'favicon_url' => 'https://cdn.labschool.sch.id/favicon.ico',
            ],
            'contact' => [
                'phone' => '(0341) 551999',
                'email' => 'sekretariat@labschool.sch.id',
                'whatsapp' => '081299998888',
            ],
            'address' => [
                'street' => 'Jl. Semarang No. 5',
                'city' => 'Kota Malang',
                'postal_code' => '65145',
                'latitude' => -7.9615,
                'longitude' => 112.6180,
                'maps_embed_url' => 'https://maps.google.com/embed?pb=xxx',
            ],
            'social_media' => [
                'instagram' => 'https://instagram.com/labschool_um',
                'youtube' => 'https://youtube.com/@labschool_um',
                'facebook' => 'https://facebook.com/labschoolum',
            ],
            'profile' => [
                'vision' => 'Visi Baru: Menjadi pelopor pendidikan sains masa depan.',
                'mission' => [
                    'Misi 1: Pendidikan inovatif berbasis riset.',
                    'Misi 2: Penguatan karakter berintegritas.',
                ],
                'principal_greeting' => [
                    'principal_name' => 'Prof. Dr. Supriyanto, M.Pd.',
                    'principal_photo_url' => 'https://cdn.labschool.sch.id/kepsek.jpg',
                    'greeting_text' => 'Salam hangat dan selamat datang di portal kami.',
                ],
                'accreditation' => [
                    'grade' => 'A',
                    'score' => 98,
                    'certificate_no' => 'BAN-S/M-99999/2024',
                    'valid_until' => '2029-12-31',
                ],
                'featured_programs' => [
                    [
                        'title' => 'Program Kelas Internasional (Cambridge)',
                        'description' => 'Kurikulum terakreditasi internasional.',
                        'icon' => 'globe',
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->adminUser)
            ->putJson('/api/v1/site-settings', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.identity.name', 'SMA Labschool Universitas Negeri Malang')
            ->assertJsonPath('data.contact.email', 'sekretariat@labschool.sch.id')
            ->assertJsonPath('data.address.street', 'Jl. Semarang No. 5')
            ->assertJsonPath('data.profile.accreditation.score', 98);

        // Verify stored in DB
        $this->assertDatabaseHas('site_settings', [
            'setting_key' => 'identity',
        ]);
        $this->assertDatabaseHas('site_settings', [
            'setting_key' => 'profile',
        ]);

        // Audit Log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->adminUser->id,
            'action' => 'site_settings.updated',
            'entity' => 'SiteSetting',
        ]);
    }

    /**
     * BE-CMS-01: Public site profile reflects updated settings
     */
    public function test_be_cms_01_public_site_reflects_updated_settings(): void
    {
        // 1. Update identity
        $this->actingAs($this->adminUser)
            ->putJson('/api/v1/site-settings', [
                'identity' => [
                    'name' => 'Portal Resmi Labschool UM Modern',
                ],
            ])
            ->assertStatus(200);

        // 2. Fetch public endpoint
        $publicResp = $this->getJson('/api/v1/public/site');

        $publicResp->assertStatus(200)
            ->assertJsonPath('data.identity.name', 'Portal Resmi Labschool UM Modern');
    }

    /**
     * BE-CMS-01: Admin can update partial sections without wiping other settings
     */
    public function test_be_cms_01_admin_can_update_partial_sections(): void
    {
        // 1. Initial full update
        $this->actingAs($this->adminUser)
            ->putJson('/api/v1/site-settings', [
                'identity' => [
                    'name' => 'SMA Labschool Awal',
                ],
                'contact' => [
                    'phone' => '0811111111',
                ],
            ])
            ->assertStatus(200);

        // 2. Update only contact
        $this->actingAs($this->adminUser)
            ->putJson('/api/v1/site-settings', [
                'contact' => [
                    'phone' => '0822222222',
                ],
            ])
            ->assertStatus(200);

        // 3. Verify identity was preserved
        $getResp = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/site-settings');

        $getResp->assertStatus(200)
            ->assertJsonPath('data.identity.name', 'SMA Labschool Awal')
            ->assertJsonPath('data.contact.phone', '0822222222');
    }
}
