<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

it('redirects to google oauth', function () {
    Socialite::fake('google');

    $response = $this->get('/auth/google');

    $response->assertRedirect();
});

it('creates new user on first google login', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('google-123');
    $socialiteUser->shouldReceive('getName')->andReturn('Budi Santoso');
    $socialiteUser->shouldReceive('getEmail')->andReturn('budi@gmail.com');
    $socialiteUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/photo.jpg');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('short-urls.index'));

    $this->assertDatabaseHas('users', [
        'google_id' => 'google-123',
        'name' => 'Budi Santoso',
        'email' => 'budi@gmail.com',
    ]);

    $user = User::where('google_id', 'google-123')->first();
    expect($user->email_verified_at)->not->toBeNull();
    $this->assertAuthenticatedAs($user);
});

it('logs in existing user by google_id', function () {
    $existing = User::factory()->create([
        'google_id' => 'google-456',
        'email' => 'existing@gmail.com',
        'password' => null,
    ]);

    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('google-456');
    $socialiteUser->shouldReceive('getName')->andReturn($existing->name);
    $socialiteUser->shouldReceive('getEmail')->andReturn($existing->email);
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('short-urls.index'));
    $this->assertAuthenticatedAs($existing);
    expect(User::where('google_id', 'google-456')->count())->toBe(1);
});

it('redirects to login on google oauth error', function () {
    Socialite::shouldReceive('driver->user')->andThrow(new Exception('OAuth error'));

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

it('google oauth routes require guest middleware', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get('/auth/google')->assertRedirect();
    $this->assertAuthenticated();
});
