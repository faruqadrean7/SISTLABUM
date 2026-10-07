<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionOption extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'question_options';

    protected $fillable = [
        'question_id',
        'label',
        'body',
        'is_correct',
        'match_key',
    ];

    protected function casts(): array
    {
        return [
            'body' => 'array',
            'is_correct' => 'boolean',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
