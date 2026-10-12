<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AppConfig extends Model
{
    use HasUuids;

    protected $table = 'app_config';

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'description',
    ];
}
