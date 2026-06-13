<?php

namespace App\Http\Controllers;

use App\Jobs\RecordVisitJob;
use App\Models\ShortUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class RedirectController extends Controller
{
    public function __invoke(Request $request, string $shortCode): RedirectResponse
    {
        $cacheKey = "short:{$shortCode}";

        /** @var array{id: int, original_url: string}|null $cached */
        $cached = Cache::get($cacheKey);

        if (! is_array($cached)) {
            $shortUrl = ShortUrl::active()->where('short_code', $shortCode)->first();

            if ($shortUrl) {
                $ttl = $shortUrl->expires_at
                    ? min(3600, max(60, (int) now()->diffInSeconds($shortUrl->expires_at)))
                    : 3600;

                $cached = [
                    'id' => $shortUrl->id,
                    'original_url' => $shortUrl->original_url,
                ];

                Cache::put($cacheKey, $cached, $ttl);
            }
        }

        if (! $cached) {
            abort(404);
        }

        RecordVisitJob::dispatch(
            $cached['id'],
            $request->ip(),
            $request->userAgent(),
            $request->headers->get('referer'),
        );

        Redis::hincrby('clicks', (string) $cached['id'], 1);

        return redirect()->away($cached['original_url']);
    }
}
