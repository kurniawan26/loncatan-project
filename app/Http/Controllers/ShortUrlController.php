<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShortUrlRequest;
use App\Http\Requests\UpdateShortUrlRequest;
use App\Models\ShortUrl;
use App\Support\ShortCodeGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShortUrlController extends Controller
{
    //
    public function index(): Response
    {
        $links = ShortUrl::where('user_id', Auth::id())->latest()->paginate(20);

        return Inertia::render('links/index', [
            'links' => $links,
        ]);
    }

    public function store(StoreShortUrlRequest $request, ShortCodeGenerator $generator): RedirectResponse
    {
        $isGuest = $request->user() === null;
        $isCustomCode = $request->filled('short_code');

        $shortUrl = ShortUrl::create([
            'user_id' => $request->user()?->id,
            'original_url' => $request->original_url,
            'short_code' => $isCustomCode ? $request->short_code : $generator->generate(),
            'is_custom_code' => $isCustomCode,
            'expires_at' => $isGuest ? now()->addDays(30) : $request->expires_at,
        ]);

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
}
