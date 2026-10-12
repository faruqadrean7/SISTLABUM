<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{
    use HasUuids;

    protected $table = 'achievements';

    protected $fillable = [
        'student_id',
        'competition_id',
        'title',
        'rank_level',
        'achieved_at',
        'certificate_file_id',
        'photo_file_id',
        'points_awarded',
        'notes',
    ];

    protected $casts = [
        'achieved_at' => 'date',
        'points_awarded' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }

    public function certificateFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'certificate_file_id');
    }

    public function photoFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'photo_file_id');
    }
}
