<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partnership extends Model
{
    use HasUuids;

    protected $fillable = [
        'institution_name',
        'type',
        'contact_person',
        'phone',
        'email',
        'address',
        'mou_number',
        'mou_file_id',
        'start_date',
        'end_date',
        'status',
        'scope',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function mouFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'mou_file_id');
    }

    public function exchangePrograms(): HasMany
    {
        return $this->hasMany(ExchangeProgram::class, 'partnership_id');
    }
}
