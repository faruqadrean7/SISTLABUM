<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamQuestion extends Model
{
    use HasFactory, HasUuids;

    const UPDATED_AT = null;

    protected $table = 'exam_questions';

    protected $fillable = [
        'exam_id',
        'question_id',
        'sort_order',
        'weight_override',
        'package_code',
    ];

    protected function casts(): array
    {
        return [
            'weight_override' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
