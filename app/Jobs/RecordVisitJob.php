<?php

namespace App\Jobs;

use App\Models\ShortUrl;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RecordVisitJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $shortUrlId,
        public readonly ?string $ipAddress,
        public readonly ?string $userAgent,
        public readonly ?string $referer,
    ) {}

    public function handle(): void
    {
        ShortUrl::find($this->shortUrlId)?->visits()->create([
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
            'referer' => $this->referer,
        ]);
    }
}
