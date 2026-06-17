<?php

namespace App\Models;

use Database\Factories\ShortUrlFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class ShortUrl extends Model
{
    /** @use HasFactory<ShortUrlFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        // When short_code changes, evict the old cache key before saving.
        static::updating(function (self $model): void {
            if ($model->isDirty('short_code')) {
                Cache::forget('short:'.$model->getOriginal('short_code'));
            }
        });

        static::saved(fn (self $model) => Cache::forget("short:{$model->short_code}"));
        static::deleted(fn (self $model) => Cache::forget("short:{$model->short_code}"));
    }

    protected $appends = ['short_url'];

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

    public function user(): BelongsTo
    {
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
