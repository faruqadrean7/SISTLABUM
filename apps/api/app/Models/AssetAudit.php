<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetAudit extends Model
{
    use HasUuids;

    protected $fillable = [
        'audit_date',
        'auditor_staff_id',
        'room_id',
        'status',
        'notes',
    ];

    protected $casts = [
        'audit_date' => 'date',
    ];

    public function auditor(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'auditor_staff_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssetAuditItem::class, 'audit_id');
    }
}
