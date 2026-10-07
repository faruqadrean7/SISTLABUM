<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityDocument extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'source_type',
        'source_id',
        'file_id',
        'caption',
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class, 'file_id');
    }
}
