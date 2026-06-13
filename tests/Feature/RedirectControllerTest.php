<?php

use App\Jobs\RecordVisitJob;
use App\Models\ShortUrl;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;

beforeEach(function () {
    Queue::fake();
    Redis::del('clicks');
});

test('active link redirects to original url', function () {
    ShortUrl::factory()->create([
        'short_code' => 'abc123',
        'original_url' => 'https://example.com',
        'is_active' => true,
        'user_id' => null,
    ]);

    $this->get(route('redirect', 'abc123'))
        ->assertRedirect('https://example.com');
});

test('redirect dispatches visit recording job', function () {
    $link = ShortUrl::factory()->create(['short_code' => 'abc123', 'user_id' => null]);

    $this->get(route('redirect', 'abc123'));

    Queue::assertPushed(RecordVisitJob::class, fn ($job) => $job->shortUrlId === $link->id);
});

test('redirect increments click count in redis', function () {
    $link = ShortUrl::factory()->create(['short_code' => 'abc123', 'user_id' => null]);

    $this->get(route('redirect', 'abc123'));

    expect((int) Redis::hget('clicks', (string) $link->id))->toBe(1);
});

test('redirect caches the short url on first hit', function () {
    ShortUrl::factory()->create(['short_code' => 'abc123', 'user_id' => null]);

    $this->get(route('redirect', 'abc123'));

    expect(Cache::has('short:abc123'))->toBeTrue();
});

test('redirect serves cached short url on subsequent hits', function () {
    $link = ShortUrl::factory()->create(['short_code' => 'abc123', 'user_id' => null]);

    $this->get(route('redirect', 'abc123'))->assertRedirect($link->original_url);
    expect(Cache::has('short:abc123'))->toBeTrue();

    // Delete without firing model events so our own cache-invalidation doesn't clear it.
    ShortUrl::withoutEvents(fn () => $link->forceDelete());

    $this->get(route('redirect', 'abc123'))->assertRedirect($link->original_url);
});

test('cache is cleared when link is updated', function () {
    $link = ShortUrl::factory()->create(['short_code' => 'abc123', 'user_id' => null]);
    Cache::put('short:abc123', ['id' => $link->id, 'original_url' => $link->original_url], 3600);

    $link->update(['is_active' => false]);

    expect(Cache::has('short:abc123'))->toBeFalse();
});

test('cache is cleared when link is deleted', function () {
    $link = ShortUrl::factory()->create(['short_code' => 'abc123', 'user_id' => null]);
    Cache::put('short:abc123', ['id' => $link->id, 'original_url' => $link->original_url], 3600);

    $link->delete();

    expect(Cache::has('short:abc123'))->toBeFalse();
});

test('inactive link returns 404', function () {
    ShortUrl::factory()->create([
        'short_code' => 'abc123',
        'is_active' => false,
        'user_id' => null,
    ]);

    $this->get(route('redirect', 'abc123'))->assertNotFound();
});

test('expired link returns 404', function () {
    ShortUrl::factory()->create([
        'short_code' => 'abc123',
        'expires_at' => now()->subDay(),
        'user_id' => null,
    ]);

    $this->get(route('redirect', 'abc123'))->assertNotFound();
});

test('non-existent short code returns 404', function () {
    $this->get(route('redirect', 'tidakada'))->assertNotFound();
});
