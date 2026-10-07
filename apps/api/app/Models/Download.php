<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Download extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'category',
        'file_id',
        'description',
        'download_count',
        'is_public',
    ];

    protected $casts = [
        'download_count' => 'integer',
        'is_public' => 'boolean',
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class, 'file_id');
    }
}
