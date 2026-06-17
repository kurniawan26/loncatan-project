<?php

use App\Http\Controllers\Auth\SocialController;
use App\Http\Controllers\RedirectController;
use App\Http\Controllers\ShortUrlController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::redirect('/dashboard', '/links')->name('dashboard');

Route::middleware('guest')->group(function () {
    Route::get('/auth/google', [SocialController::class, 'redirect'])->name('auth.google');
    Route::get('/auth/google/callback', [SocialController::class, 'callback'])->name('auth.google.callback');
});

require __DIR__.'/settings.php';

Route::post('/links', [ShortUrlController::class, 'store'])
    ->middleware('throttle:create-link')
    ->name('short-urls.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/links', [ShortUrlController::class, 'index'])->name('short-urls.index');
    Route::get('/links/create', [ShortUrlController::class, 'create'])->name('short-urls.create');
    Route::put('/links/{shortUrl}', [ShortUrlController::class, 'update'])->name('short-urls.update');
    Route::delete('/links/{shortUrl}', [ShortUrlController::class, 'destroy'])->name('short-urls.destroy');
});

Route::get('/{shortCode}', RedirectController::class)
    ->middleware('throttle:redirect')
    ->name('redirect');
