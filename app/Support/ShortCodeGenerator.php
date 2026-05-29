<?php

namespace App\Support;

use Illuminate\Support\Facades\Redis;

class ShortCodeGenerator
{
    private const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private const BASE = 62;
    private const MIN = 62 ** 5; // 62^5 = 916,132,832
    private const RANGE = 62 ** 6 - self::MIN; // 62^6 - 62^5 = 56,800,235,584
    private const MULTIPLIER = 2654435761; // A large prime number for hashing

    public function __construct(private readonly int $salt) {}

    public function generate(): string
    {
        $counter = Redis::incr('short_url_counter');
        $scrambled = ($counter * self::MULTIPLIER + $this->salt) % self::RANGE;
        $value = $scrambled + self::MIN;

        return $this->encode($value);
    }

    private function encode(int $value): string
    {
        $shortCode = "";
        while ($value > 0) {
            $shortCode = self::CHARSET[$value % self::BASE] . $shortCode;
            $value = intdiv($value, self::BASE);
        }

        return $shortCode;
    }
}
