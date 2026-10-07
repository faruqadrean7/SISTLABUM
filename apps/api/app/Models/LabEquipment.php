<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabEquipment extends Model
{
    use HasUuids;

    protected $table = 'lab_equipment';

    protected $fillable = [
        'code',
        'name',
        'room_id',
        'category',
        'total_qty',
        'available_qty',
        'condition',
        'notes',
    ];

    protected $casts = [
        'total_qty' => 'integer',
        'available_qty' => 'integer',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(LabLoan::class, 'equipment_id');
    }
}
