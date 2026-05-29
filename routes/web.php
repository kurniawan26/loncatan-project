<?php

use App\Http\Controllers\RedirectController;
use App\Http\Controllers\ShortUrlController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::post('/links', [ShortUrlController::class, 'store'])
    ->middleware('throttle:create-link')
    ->name('short-urls.store');

require __DIR__ . '/settings.php';
require __DIR__ . '/dashboard.php';

// Catch-all — must be last to avoid swallowing named routes
Route::get('/{shortCode}', RedirectController::class)->name('redirect');
