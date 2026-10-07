<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'staff';

    protected $fillable = [
        'school_id',
        'user_id',
        'full_name',
        'position',
        'unit',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
