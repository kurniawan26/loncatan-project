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

        /** @var ShortUrl|null $shortUrl */
        $shortUrl = Cache::get($cacheKey);

        if ($shortUrl === null) {
            $shortUrl = ShortUrl::active()->where('short_code', $shortCode)->first();

            if ($shortUrl) {
                $ttl = $shortUrl->expires_at
                    ? min(3600, max(60, (int) now()->diffInSeconds($shortUrl->expires_at)))
                    : 3600;

                Cache::put($cacheKey, $shortUrl, $ttl);
            }
        }

        if (! $shortUrl) {
            abort(404);
        }

        RecordVisitJob::dispatch(
            $shortUrl->id,
            $request->ip(),
            $request->userAgent(),
            $request->headers->get('referer'),
        );

        Redis::hincrby('clicks', (string) $shortUrl->id, 1);

        return redirect()->away($shortUrl->original_url);
    }
}
