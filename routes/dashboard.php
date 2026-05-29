<?php

use App\Http\Controllers\ShortUrlController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('/links', [ShortUrlController::class, 'index'])->name('short-urls.index');
    Route::put('/links/{shortUrl}', [ShortUrlController::class, 'update'])->name('short-urls.update');
    Route::delete('/links/{shortUrl}', [ShortUrlController::class, 'destroy'])->name('short-urls.destroy');
});
