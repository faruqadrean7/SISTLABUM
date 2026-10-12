<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PPDBRequirement extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ppdb_requirements';

    protected $fillable = [
        'track_id',
        'document_type',
        'is_required',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
        ];
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(PPDBTrack::class, 'track_id');
    }
}
