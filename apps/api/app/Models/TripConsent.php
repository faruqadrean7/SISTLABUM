<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripConsent extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'trip_id',
        'student_id',
        'guardian_id',
        'is_consented',
        'consent_at',
        'notes',
        'signature_file_id',
    ];

    protected $casts = [
        'is_consented' => 'boolean',
        'consent_at' => 'datetime',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class, 'trip_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class, 'guardian_id');
    }

    public function signatureFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'signature_file_id');
    }
}
