<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabLoan extends Model
{
    use HasUuids;

    protected $fillable = [
        'equipment_id',
        'borrower_user_id',
        'qty',
        'loan_date',
        'due_date',
        'return_date',
        'status',
        'purpose',
        'notes',
    ];

    protected $casts = [
        'qty' => 'integer',
        'loan_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(LabEquipment::class, 'equipment_id');
    }

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_user_id');
    }
}
