<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CounselingCase extends Model
{
    use HasUuids;

    protected $fillable = [
        'case_number',
        'student_id',
        'counselor_teacher_id',
        'category',
        'urgency',
        'status',
        'summary_enc',
        'started_at',
        'closed_at',
    ];

    protected $casts = [
        'summary_enc' => 'encrypted',
        'started_at' => 'date',
        'closed_at' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function counselor(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'counselor_teacher_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CounselingSession::class, 'case_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(CounselingReferral::class, 'case_id');
    }
}
