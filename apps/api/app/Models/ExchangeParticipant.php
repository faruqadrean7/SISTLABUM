<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangeParticipant extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'program_id',
        'student_id',
        'status',
        'passport_number',
        'notes',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ExchangeProgram::class, 'program_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
