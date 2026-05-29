<?php

use App\Models\ShortUrl;

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

test('redirect records a visit', function () {
    $link = ShortUrl::factory()->create([
        'short_code' => 'abc123',
        'user_id' => null,
    ]);

    $this->get(route('redirect', 'abc123'));

    $this->assertDatabaseHas('short_url_visits', [
        'short_url_id' => $link->id,
    ]);
});

test('redirect increments clicks count', function () {
    $link = ShortUrl::factory()->create([
        'short_code' => 'abc123',
        'clicks_count' => 0,
        'user_id' => null,
    ]);

    $this->get(route('redirect', 'abc123'));

    expect($link->fresh()->clicks_count)->toBe(1);
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
