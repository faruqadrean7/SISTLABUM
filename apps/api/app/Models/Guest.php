<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guest extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'institution',
        'phone',
        'email',
        'purpose',
        'person_to_meet_user_id',
        'check_in_at',
        'check_out_at',
        'signature_file_id',
        'notes',
    ];

    protected $casts = [
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
    ];

    public function personToMeet(): BelongsTo
    {
        return $this->belongsTo(User::class, 'person_to_meet_user_id');
    }

    public function signatureFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'signature_file_id');
    }
}
