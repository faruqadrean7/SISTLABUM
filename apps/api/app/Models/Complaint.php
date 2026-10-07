<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    use HasUuids;

    protected $fillable = [
        'ticket_number',
        'is_anonymous',
        'reporter_name',
        'reporter_contact',
        'category',
        'subject',
        'description',
        'status',
        'assigned_to_user_id',
        'resolution',
        'resolved_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(ComplaintEvent::class, 'complaint_id');
    }
}
