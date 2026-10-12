<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable, SoftDeletes;

    protected $fillable = [
        'school_id',
        'username',
        'email',
        'phone',
        'password_hash',
        'status',
        'must_change_password',
        'last_login_at',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'must_change_password' => 'boolean',
            'last_login_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }

    /**
     * Override default password column name for Laravel authentication.
     */
    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    // Profil Relasi
    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    public function guardian(): HasOne
    {
        return $this->hasOne(Guardian::class);
    }

    public function staff(): HasOne
    {
        return $this->hasOne(Staff::class);
    }

    public function applicant(): HasOne
    {
        return $this->hasOne(Applicant::class);
    }

    public function applicants(): HasMany
    {
        return $this->hasMany(Applicant::class);
    }

    // RBAC
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
            ->withPivot('scope_class_id');
    }

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'actor_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function hasRole(string|array $roles): bool
    {
        $this->loadMissing('roles');
        $roleCodes = (array) $roles;

        return $this->roles->contains(function ($role) use ($roleCodes) {
            return in_array($role->code, $roleCodes, true);
        });
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super_admin')) {
            return true;
        }

        $this->loadMissing('roles.permissions');

        return $this->roles->flatMap->permissions->contains('code', $permission);
    }

    public function getAllPermissions(): array
    {
        if ($this->hasRole('super_admin')) {
            return Permission::pluck('code')->all();
        }

        return $this->roles->flatMap->permissions->pluck('code')->unique()->values()->all();
    }

    public function getProfileSummary(): ?array
    {
        if ($this->relationLoaded('student') && $this->student) {
            $this->student->loadMissing('classes');
            $activeClass = $this->student->classes->first();

            return [
                'type' => 'student',
                'id' => $this->student->id,
                'name' => $this->student->full_name,
                'nis' => $this->student->nis,
                'nisn' => $this->student->nisn,
                'gender' => $this->student->gender,
                'status' => $this->student->status,
                'className' => $activeClass?->name,
                'classId' => $activeClass?->id,
            ];
        }

        if ($this->relationLoaded('teacher') && $this->teacher) {
            return [
                'type' => 'teacher',
                'id' => $this->teacher->id,
                'name' => $this->teacher->full_name,
                'nip' => $this->teacher->nip,
                'nuptk' => $this->teacher->nuptk,
                'position' => $this->teacher->position,
                'status' => $this->teacher->status,
            ];
        }

        if ($this->relationLoaded('guardian') && $this->guardian) {
            $this->guardian->loadMissing('students.classes');
            $children = $this->guardian->students ? $this->guardian->students->map(function ($s) {
                $activeClass = $s->classes->first();

                return [
                    'id' => $s->id,
                    'name' => $s->full_name,
                    'nis' => $s->nis,
                    'nisn' => $s->nisn,
                    'gender' => $s->gender,
                    'className' => $activeClass?->name,
                    'classId' => $activeClass?->id,
                ];
            })->all() : [];

            return [
                'type' => 'guardian',
                'id' => $this->guardian->id,
                'name' => $this->guardian->full_name,
                'phone' => $this->guardian->phone,
                'children' => $children,
            ];
        }

        if ($this->relationLoaded('staff') && $this->staff) {
            return [
                'type' => 'staff',
                'name' => $this->staff->full_name,
                'position' => $this->staff->position,
                'unit' => $this->staff->unit,
            ];
        }

        if ($this->relationLoaded('applicant') && $this->applicant) {
            return [
                'type' => 'applicant',
                'name' => $this->applicant->full_name,
                'registration_no' => $this->applicant->registration_no,
                'status' => $this->applicant->status,
            ];
        }

        return null;
    }
}
