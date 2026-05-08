<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShortUrl extends Model
{
    /** @use HasFactory<\Database\Factories\ShortUrlFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_url',
        'short_code',
        'is_custom_code',
        'clicks_count',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_custom_code' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user() : BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(ShortUrlVisit::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true)
                ->where(fn ($query) => $query
                ->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && 
        $this->expires_at->isPast();
    }

    public function getShortUrlAttribute(): string
    {
        return url($this->short_code);
    }
}
