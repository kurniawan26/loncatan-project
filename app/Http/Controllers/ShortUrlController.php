<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShortUrlRequest;
use App\Http\Requests\UpdateShortUrlRequest;
use App\Models\ShortUrl;
use App\Support\ShortCodeGenerator;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ShortUrlController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();
        $since = now()->subDays(29)->startOfDay()->toImmutable();

        $links = ShortUrl::where('user_id', $userId)->latest()->paginate(20);
        $linkIds = $links->pluck('id');

        $dailyByLink = DB::table('short_url_visits')
            ->selectRaw('short_url_id, DATE(created_at) as date, COUNT(*) as count')
            ->whereIn('short_url_id', $linkIds)
            ->where('created_at', '>=', $since)
            ->groupBy('short_url_id', DB::raw('DATE(created_at)'))
            ->get()
            ->groupBy('short_url_id')
            ->map(fn ($rows) => $rows->pluck('count', 'date'));

        $clicks7ByLink = DB::table('short_url_visits')
            ->selectRaw('short_url_id, COUNT(*) as count')
            ->whereIn('short_url_id', $linkIds)
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('short_url_id')
            ->pluck('count', 'short_url_id');

        $totalClicksByLink = DB::table('short_url_visits')
            ->selectRaw('short_url_id, COUNT(*) as count')
            ->whereIn('short_url_id', $linkIds)
            ->groupBy('short_url_id')
            ->pluck('count', 'short_url_id');

        $links->getCollection()->transform(function (ShortUrl $link) use ($since, $dailyByLink, $clicks7ByLink, $totalClicksByLink) {
            $dayMap = $dailyByLink->get($link->id, collect());
            $link->daily = collect(range(0, 29))
                ->map(fn (int $i) => (int) ($dayMap->get($since->addDays($i)->toDateString()) ?? 0))
                ->values()
                ->all();
            $link->clicks7 = (int) ($clicks7ByLink->get($link->id) ?? 0);
            $link->clicks_count = (int) ($totalClicksByLink->get($link->id) ?? 0);

            return $link;
        });

        $trendRaw = DB::table('short_url_visits')
            ->join('short_urls', 'short_urls.id', '=', 'short_url_visits.short_url_id')
            ->selectRaw('DATE(short_url_visits.created_at) as date, COUNT(*) as count')
            ->where('short_urls.user_id', $userId)
            ->where('short_url_visits.created_at', '>=', $since)
            ->groupBy(DB::raw('DATE(short_url_visits.created_at)'))
            ->pluck('count', 'date');

        $trend30 = collect(range(0, 29))
            ->map(fn (int $i) => (int) ($trendRaw->get($since->addDays($i)->toDateString()) ?? 0))
            ->values()
            ->all();

        $totalClicks = (int) DB::table('short_url_visits')
            ->join('short_urls', 'short_urls.id', '=', 'short_url_visits.short_url_id')
            ->where('short_urls.user_id', $userId)
            ->count();

        return Inertia::render('links/index', [
            'links' => $links,
            'linkCount' => $links->total(),
            'stats' => [
                'totalClicks' => $totalClicks,
                'activeCount' => ShortUrl::where('user_id', $userId)->active()->count(),
                'totalCount' => ShortUrl::where('user_id', $userId)->count(),
                'clicks7Total' => (int) DB::table('short_url_visits')
                    ->join('short_urls', 'short_urls.id', '=', 'short_url_visits.short_url_id')
                    ->where('short_urls.user_id', $userId)
                    ->where('short_url_visits.created_at', '>=', now()->subDays(7))
                    ->count(),
                'trend30' => $trend30,
            ],
        ]);
    }

    public function store(StoreShortUrlRequest $request, ShortCodeGenerator $generator): RedirectResponse
    {
        $isGuest = $request->user() === null;
        $isCustomCode = $request->filled('short_code');

        $shortUrl = null;
        $attempts = $isCustomCode ? 1 : 5;

        for ($i = 0; $i < $attempts; $i++) {
            try {
                $shortUrl = ShortUrl::create([
                    'user_id' => $request->user()?->id,
                    'original_url' => $request->original_url,
                    'short_code' => $isCustomCode ? $request->short_code : $generator->generate(),
                    'is_custom_code' => $isCustomCode,
                    'expires_at' => $isGuest ? now()->addDays(30) : $request->expires_at,
                ]);
                break;
            } catch (UniqueConstraintViolationException $e) {
                if ($i === $attempts - 1) {
                    throw $e;
                }
            }
        }

        return $isGuest
            ? back()->with('flash', ['shortUrl' => $shortUrl->refresh()->short_url])
            : redirect()->route('short-urls.index')->with('success', 'Link berhasil dibuat!');
    }

    public function update(UpdateShortUrlRequest $request, ShortUrl $shortUrl): RedirectResponse
    {
        $this->authorize('update', $shortUrl);

        $shortUrl->update($request->validated());

        return redirect()->route('short-urls.index')->with('success', 'Link berhasil diperbarui!');
    }

    public function destroy(ShortUrl $shortUrl): RedirectResponse
    {
        $this->authorize('delete', $shortUrl);

        $shortUrl->delete();

        return redirect()->route('short-urls.index')->with('success', 'Link berhasil dihapus!');
    }

    public function create(): Response
    {
        return Inertia::render('links/create');
    }
}
