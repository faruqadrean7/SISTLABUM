<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PPDBWave extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ppdb_waves';

    protected $fillable = [
        'school_id',
        'name',
        'open_at',
        'close_at',
        'result_publish_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'open_at' => 'datetime',
            'close_at' => 'datetime',
            'result_publish_at' => 'datetime',
        ];
    }

    public function tracks(): HasMany
    {
        return $this->hasMany(PPDBTrack::class, 'wave_id');
    }

    public function applicants(): HasMany
    {
        return $this->hasMany(Applicant::class, 'wave_id');
    }
}
