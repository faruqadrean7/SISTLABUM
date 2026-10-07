<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facility extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'code',
        'category',
        'room_id',
        'capacity',
        'description',
        'photo_file_id',
        'is_bookable',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'is_bookable' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function photoFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'photo_file_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'facility_id');
    }
}
