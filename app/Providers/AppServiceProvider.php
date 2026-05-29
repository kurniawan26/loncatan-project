<?php

namespace App\Providers;

use App\Support\ShortCodeGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ShortCodeGenerator::class, function () {
            return new ShortCodeGenerator(config('shortcode.salt'));
        });
    }

    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiters();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }

    protected function configureRateLimiters(): void
    {
        RateLimiter::for('create-link', function (Request $request) {
            return $request->user()
                ? Limit::perHour(50)->by($request->user()->id)
                : Limit::perHour(5)->by($request->ip());
        });
    }
}
