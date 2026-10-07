<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'competition_id',
        'title',
        'level',
        'rank',
        'certificate_file_id',
        'points_awarded',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'points_awarded' => 'integer',
        'verified_at' => 'datetime',
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

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
