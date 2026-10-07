<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantStatusHistory extends Model
{
    use HasFactory, HasUuids;

    const UPDATED_AT = null;

    protected $table = 'applicant_status_history';

    protected $fillable = [
        'applicant_id',
        'from_status',
        'to_status',
        'note',
        'actor_id',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
