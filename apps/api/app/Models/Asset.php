<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    use HasUuids;

    protected $fillable = [
        'asset_code',
        'name',
        'category',
        'brand',
        'model',
        'serial_number',
        'room_id',
        'pic_staff_id',
        'condition',
        'procurement_date',
        'procurement_cost',
        'source_of_fund',
        'status',
        'qr_code',
        'notes',
    ];

    protected $casts = [
        'procurement_date' => 'date',
        'procurement_cost' => 'decimal:2',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function picStaff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'pic_staff_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'asset_id');
    }

    public function auditItems(): HasMany
    {
        return $this->hasMany(AssetAuditItem::class, 'asset_id');
    }
}
