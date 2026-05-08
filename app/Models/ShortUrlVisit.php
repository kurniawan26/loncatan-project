<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShortUrlVisit extends Model
{
    //
    const UPDATED_AT = null;

    protected $fillable = [
        'short_url_id',
        'ip_address',
        'user_agent',
        'referer',
    ];

    public function shortUrl()
    {
        return $this->belongsTo(ShortUrl::class);
    }
}
