<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselingRequest extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'requested_date',
        'preferred_time',
        'preferred_counselor_id',
        'topic',
        'status',
        'scheduled_at',
        'rejection_reason',
    ];

    protected $casts = [
        'requested_date' => 'date',
        'scheduled_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function preferredCounselor(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'preferred_counselor_id');
    }
}
