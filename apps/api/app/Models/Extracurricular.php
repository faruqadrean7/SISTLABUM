<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Extracurricular extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'code',
        'category',
        'description',
        'coach_teacher_id',
        'schedule_day',
        'schedule_time',
        'max_members',
        'is_active',
    ];

    protected $casts = [
        'max_members' => 'integer',
        'is_active' => 'boolean',
    ];

    public function coach(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'coach_teacher_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ExtracurricularMember::class, 'extracurricular_id');
    }

    public function journals(): HasMany
    {
        return $this->hasMany(ExtracurricularJournal::class, 'extracurricular_id');
    }
}
