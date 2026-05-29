<?php

use App\Models\ShortUrl;
use App\Models\User;
use App\Support\ShortCodeGenerator;

beforeEach(function () {
    $mock = Mockery::mock(ShortCodeGenerator::class);
    $mock->shouldReceive('generate')->andReturn('abc123');
    $this->app->instance(ShortCodeGenerator::class, $mock);
});

// index
test('guests are redirected to login when accessing links index', function () {
    $this->get(route('short-urls.index'))->assertRedirect(route('login'));
});

test('authenticated users see only their own links', function () {
    $user = User::factory()->create();
    ShortUrl::factory()->create(['user_id' => $user->id]);
    ShortUrl::factory()->create(); // belongs to another user

    $this->actingAs($user)
        ->get(route('short-urls.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('links.data', 1));
});

// store — guest
test('guests can create a short url and receive it via flash', function () {
    $this->post(route('short-urls.store'), ['original_url' => 'https://example.com'])
        ->assertRedirect()
        ->assertSessionHas('flash');

    $this->assertDatabaseHas('short_urls', [
        'original_url' => 'https://example.com',
        'short_code' => 'abc123',
        'user_id' => null,
        'is_custom_code' => false,
    ]);
});

test('guest links expire in 30 days', function () {
    $this->post(route('short-urls.store'), ['original_url' => 'https://example.com']);

    expect(ShortUrl::first()->expires_at->diffInDays(now()))->toBeLessThanOrEqual(30);
});

test('guests can use a custom short code', function () {
    $this->post(route('short-urls.store'), [
        'original_url' => 'https://example.com',
        'short_code' => 'mycustom',
    ]);

    $this->assertDatabaseHas('short_urls', [
        'short_code' => 'mycustom',
        'is_custom_code' => true,
    ]);
});

// store — authenticated
test('authenticated users can create a short url', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('short-urls.store'), ['original_url' => 'https://example.com'])
        ->assertRedirect(route('short-urls.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('short_urls', [
        'user_id' => $user->id,
        'original_url' => 'https://example.com',
    ]);
});

test('authenticated user links have no forced expiry', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('short-urls.store'), ['original_url' => 'https://example.com']);

    expect(ShortUrl::first()->expires_at)->toBeNull();
});

// store — validation
test('store rejects a missing url', function () {
    $this->post(route('short-urls.store'), [])
        ->assertSessionHasErrors('original_url');
});

test('store rejects an invalid url format', function () {
    $this->post(route('short-urls.store'), ['original_url' => 'not-a-url'])
        ->assertSessionHasErrors('original_url');
});

test('store rejects a duplicate custom code', function () {
    ShortUrl::factory()->create(['user_id' => null, 'short_code' => 'taken1']);

    $this->post(route('short-urls.store'), [
        'original_url' => 'https://example.com',
        'short_code' => 'taken1',
    ])->assertSessionHasErrors('short_code');
});

test('store rejects a custom code shorter than 3 characters', function () {
    $this->post(route('short-urls.store'), [
        'original_url' => 'https://example.com',
        'short_code' => 'ab',
    ])->assertSessionHasErrors('short_code');
});

// update
test('users can update their own link', function () {
    $user = User::factory()->create();
    $link = ShortUrl::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put(route('short-urls.update', $link), ['original_url' => 'https://updated.com'])
        ->assertRedirect(route('short-urls.index'));

    $this->assertDatabaseHas('short_urls', [
        'id' => $link->id,
        'original_url' => 'https://updated.com',
    ]);
});

test('users cannot update another users link', function () {
    $link = ShortUrl::factory()->create();
    $attacker = User::factory()->create();

    $this->actingAs($attacker)
        ->put(route('short-urls.update', $link), ['original_url' => 'https://hacked.com'])
        ->assertForbidden();

    $this->assertDatabaseMissing('short_urls', ['original_url' => 'https://hacked.com']);
});

// destroy
test('users can delete their own link', function () {
    $user = User::factory()->create();
    $link = ShortUrl::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('short-urls.destroy', $link))
        ->assertRedirect(route('short-urls.index'));

    $this->assertDatabaseMissing('short_urls', ['id' => $link->id]);
});

test('users cannot delete another users link', function () {
    $link = ShortUrl::factory()->create();
    $attacker = User::factory()->create();

    $this->actingAs($attacker)
        ->delete(route('short-urls.destroy', $link))
        ->assertForbidden();

    $this->assertDatabaseHas('short_urls', ['id' => $link->id]);
});
