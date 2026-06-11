<?php

use App\Models\ShortUrl;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(fn () => RateLimiter::clear('redirect'));

test('redirect limiter allows 60 requests per minute per ip', function () {
    $limiter = RateLimiter::limiter('redirect');
    $request = Request::create('/test', 'GET');
    $request->server->set('REMOTE_ADDR', '1.2.3.4');

    /** @var Limit $limit */
    $limit = $limiter($request);

    expect($limit->maxAttempts)->toBe(60)
        ->and($limit->decaySeconds)->toBe(60)
        ->and($limit->key)->toBe('1.2.3.4');
});

test('register limiter allows 5 requests per hour per ip', function () {
    $limiter = RateLimiter::limiter('register');
    $request = Request::create('/register', 'POST');
    $request->server->set('REMOTE_ADDR', '1.2.3.4');

    /** @var Limit $limit */
    $limit = $limiter($request);

    expect($limit->maxAttempts)->toBe(5)
        ->and($limit->decaySeconds)->toBe(3600)
        ->and($limit->key)->toBe('1.2.3.4');
});

test('redirect returns 429 when rate limit is exceeded', function () {
    $shortUrl = ShortUrl::factory()->create(['is_active' => true]);

    $request = request();
    $limiter = RateLimiter::limiter('redirect');
    $limit = $limiter($request);
    $key = md5('redirect'.$limit->key);

    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit($key, $limit->decaySeconds);
    }

    $this->get("/{$shortUrl->short_code}")
        ->assertStatus(429)
        ->assertInertia(fn ($page) => $page
            ->component('error')
            ->where('status', 429)
        );
});

test('redirect is accessible before rate limit is hit', function () {
    $shortUrl = ShortUrl::factory()->create(['is_active' => true]);

    $this->get("/{$shortUrl->short_code}")
        ->assertRedirect($shortUrl->original_url);
});
