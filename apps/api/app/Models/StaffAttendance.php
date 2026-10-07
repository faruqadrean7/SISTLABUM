<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffAttendance extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'staff_attendances';

    protected $fillable = [
        'user_id',
        'att_date',
        'check_in',
        'check_out',
        'lat',
        'lng',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'att_date' => 'date',
            'check_in' => 'datetime',
            'check_out' => 'datetime',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
