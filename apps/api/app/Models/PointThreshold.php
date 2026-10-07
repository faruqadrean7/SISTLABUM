<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PointThreshold extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'min_points',
        'action_required',
        'notify_roles',
        'is_active',
    ];

    protected $casts = [
        'min_points' => 'integer',
        'notify_roles' => 'array',
        'is_active' => 'boolean',
    ];
}
