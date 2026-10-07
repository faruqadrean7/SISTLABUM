<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryBook extends Model
{
    use HasUuids;

    protected $fillable = [
        'isbn',
        'call_number',
        'title',
        'author',
        'publisher',
        'publish_year',
        'category',
        'total_copies',
        'available_copies',
        'cover_file_id',
        'location_shelf',
    ];

    protected $casts = [
        'publish_year' => 'integer',
        'total_copies' => 'integer',
        'available_copies' => 'integer',
    ];

    public function coverFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'cover_file_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'book_id');
    }
}
