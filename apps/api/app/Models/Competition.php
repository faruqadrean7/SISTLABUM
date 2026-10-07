<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Competition extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'organizer',
        'level',
        'category',
        'field',
        'registration_deadline',
        'start_date',
        'end_date',
        'location',
        'url',
        'status',
        'created_by',
    ];

    protected $casts = [
        'registration_deadline' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(CompetitionEntry::class, 'competition_id');
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class, 'competition_id');
    }
}
