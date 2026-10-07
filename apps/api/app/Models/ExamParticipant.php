<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamParticipant extends Model
{
    use HasFactory, HasUuids;

    const UPDATED_AT = null;

    protected $table = 'exam_participants';

    protected $fillable = [
        'exam_id',
        'student_id',
        'exam_room_id',
        'package_code',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function examRoom(): BelongsTo
    {
        return $this->belongsTo(ExamRoom::class);
    }
}
