<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'destination',
        'departure_date',
        'return_date',
        'description',
        'cost_per_student',
        'max_participants',
        'pic_teacher_id',
        'status',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'cost_per_student' => 'decimal:2',
        'max_participants' => 'integer',
    ];

    public function pic(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'pic_teacher_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(TripParticipant::class, 'trip_id');
    }

    public function consents(): HasMany
    {
        return $this->hasMany(TripConsent::class, 'trip_id');
    }
}
