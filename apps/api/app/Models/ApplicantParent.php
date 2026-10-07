<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantParent extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'applicant_parents';

    protected $fillable = [
        'applicant_id',
        'parent_type',
        'name',
        'occupation',
        'income_range',
        'phone',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
