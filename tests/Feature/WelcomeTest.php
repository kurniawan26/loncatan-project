<?php

use App\Models\ShortUrl;
use App\Support\ShortCodeGenerator;

beforeEach(function () {
    $mock = Mockery::mock(ShortCodeGenerator::class);
    $mock->shouldReceive('generate')->andReturn('abc123');
    $this->app->instance(ShortCodeGenerator::class, $mock);
});

test('welcome page renders for guests', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

test('flash shortUrl is shared on welcome page after guest store', function () {
    $this->post(route('short-urls.store'), ['original_url' => 'https://example.com']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page->where('flash.shortUrl', fn ($v) => str_contains($v, 'abc123'))
        );

    $this->assertDatabaseHas('short_urls', [
        'original_url' => 'https://example.com',
        'short_code' => 'abc123',
        'user_id' => null,
    ]);
});
