<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExtracurricularJournal extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'extracurricular_id',
        'date',
        'activity_name',
        'material_summary',
        'attendance_count',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
        'attendance_count' => 'integer',
    ];

    public function extracurricular(): BelongsTo
    {
        return $this->belongsTo(Extracurricular::class, 'extracurricular_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
