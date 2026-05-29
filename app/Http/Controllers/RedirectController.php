<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RedirectController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $shortCode): RedirectResponse
    {
        //
        $shortUrl = ShortUrl::active()->where('short_code', $shortCode)->firstOrFail();

        $shortUrl->visits()->create([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->headers->get('referer'),
        ]);

        $shortUrl->increment('clicks_count');

        return redirect()->away($shortUrl->original_url);
    }
}
