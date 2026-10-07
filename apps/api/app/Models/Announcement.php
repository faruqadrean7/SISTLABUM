<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'content',
        'target_roles',
        'target_classes',
        'priority',
        'attachment_file_id',
        'publish_at',
        'expires_at',
        'created_by',
    ];

    protected $casts = [
        'target_roles' => 'array',
        'target_classes' => 'array',
        'publish_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(File::class, 'attachment_file_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(AnnouncementRead::class, 'announcement_id');
    }
}
