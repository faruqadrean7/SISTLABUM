<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PPDBTrack extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ppdb_tracks';

    protected $fillable = [
        'wave_id',
        'code',
        'name',
        'quota',
        'score_formula',
    ];

    protected function casts(): array
    {
        return [
            'score_formula' => 'array',
        ];
    }

    public function wave(): BelongsTo
    {
        return $this->belongsTo(PPDBWave::class, 'wave_id');
    }

    public function requirements(): HasMany
    {
        return $this->hasMany(PPDBRequirement::class, 'track_id');
    }

    public function applicants(): HasMany
    {
        return $this->hasMany(Applicant::class, 'track_id');
    }
}
