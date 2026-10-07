<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselingSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'case_id',
        'session_number',
        'date',
        'start_time',
        'end_time',
        'place',
        'notes_enc',
        'follow_up_plan',
        'counselor_teacher_id',
    ];

    protected $casts = [
        'session_number' => 'integer',
        'date' => 'date',
        'notes_enc' => 'encrypted',
    ];

    public function case(): BelongsTo
    {
        return $this->belongsTo(CounselingCase::class, 'case_id');
    }

    public function counselor(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'counselor_teacher_id');
    }
}
