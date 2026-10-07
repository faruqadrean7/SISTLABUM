<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bulletin extends Model
{
    use HasUuids;

    protected $fillable = [
        'edition',
        'title',
        'publish_date',
        'pdf_file_id',
        'cover_file_id',
        'description',
        'is_published',
    ];

    protected $casts = [
        'publish_date' => 'date',
        'is_published' => 'boolean',
    ];

    public function pdfFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'pdf_file_id');
    }

    public function coverFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'cover_file_id');
    }
}
