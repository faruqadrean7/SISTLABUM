<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselingReferral extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'case_id',
        'referred_to',
        'specialist_name',
        'reason',
        'referral_date',
        'report_file_id',
        'status',
    ];

    protected $casts = [
        'referral_date' => 'date',
    ];

    public function case(): BelongsTo
    {
        return $this->belongsTo(CounselingCase::class, 'case_id');
    }

    public function reportFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'report_file_id');
    }
}
