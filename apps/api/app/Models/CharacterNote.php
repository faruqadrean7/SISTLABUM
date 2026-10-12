<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CharacterNote extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'character_notes';

    protected $fillable = [
        'student_id',
        'period_id',
        'scale_data',
        'homeroom_note',
        'author_id',
    ];

    protected function casts(): array
    {
        return [
            'scale_data' => 'array',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(GradePeriod::class, 'period_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
