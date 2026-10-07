<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetAuditItem extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'audit_id',
        'asset_id',
        'condition_found',
        'is_present',
        'notes',
    ];

    protected $casts = [
        'is_present' => 'boolean',
    ];

    public function audit(): BelongsTo
    {
        return $this->belongsTo(AssetAudit::class, 'audit_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }
}
