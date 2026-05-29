<?php

namespace Database\Factories;

use App\Models\ShortUrl;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShortUrl>
 */
class ShortUrlFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'original_url' => fake()->url(),
            'short_code' => fake()->unique()->lexify('??????'),
            'is_custom_code' => false,
            'clicks_count' => 0,
            'is_active' => true,
            'expires_at' => null,
        ];
    }
}
