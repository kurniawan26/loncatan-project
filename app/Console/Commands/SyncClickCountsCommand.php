<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

#[Signature('links:sync-clicks')]
#[Description('Sync Redis click counters to the database')]
class SyncClickCountsCommand extends Command
{
    public function handle(): void
    {
        // Atomically hand off the hash to a temp key so new increments
        // during this sync go into a fresh 'clicks' hash without being lost.
        if (! Redis::exists('clicks')) {
            return;
        }

        Redis::rename('clicks', 'clicks_syncing');

        $counts = Redis::hgetall('clicks_syncing');
        Redis::del('clicks_syncing');

        foreach ($counts as $id => $count) {
            DB::table('short_urls')
                ->where('id', (int) $id)
                ->increment('clicks_count', (int) $count);
        }
    }
}
