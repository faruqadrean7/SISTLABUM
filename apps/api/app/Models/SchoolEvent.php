<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolEvent extends Model
{
    use HasUuids;

    protected $table = 'events';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'start_datetime',
        'end_datetime',
        'location',
        'is_public',
        'banner_file_id',
        'created_by',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'is_public' => 'boolean',
    ];

    public function banner(): BelongsTo
    {
        return $this->belongsTo(File::class, 'banner_file_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
