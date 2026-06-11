<?php

use App\Models\ShortUrl;
use Illuminate\Support\Facades\Redis;

beforeEach(fn () => Redis::del('clicks', 'clicks_syncing'));

test('command flushes redis hash and increments db click counts', function () {
    $a = ShortUrl::factory()->create(['clicks_count' => 10]);
    $b = ShortUrl::factory()->create(['clicks_count' => 0]);

    Redis::hincrby('clicks', (string) $a->id, 5);
    Redis::hincrby('clicks', (string) $b->id, 3);

    $this->artisan('links:sync-clicks')->assertSuccessful();

    expect($a->fresh()->clicks_count)->toBe(15)
        ->and($b->fresh()->clicks_count)->toBe(3);

    expect(Redis::exists('clicks'))->toBe(0);
});

test('command does nothing when redis hash is empty', function () {
    $link = ShortUrl::factory()->create(['clicks_count' => 7]);

    $this->artisan('links:sync-clicks')->assertSuccessful();

    expect($link->fresh()->clicks_count)->toBe(7);
});
