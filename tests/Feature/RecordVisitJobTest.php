<?php

use App\Jobs\RecordVisitJob;
use App\Models\ShortUrl;

test('job inserts visit record to database', function () {
    $link = ShortUrl::factory()->create();

    RecordVisitJob::dispatchSync($link->id, '1.2.3.4', 'Mozilla/5.0', 'https://google.com');

    $this->assertDatabaseHas('short_url_visits', [
        'short_url_id' => $link->id,
        'ip_address' => '1.2.3.4',
        'referer' => 'https://google.com',
    ]);
});

test('job silently skips deleted short url', function () {
    RecordVisitJob::dispatchSync(999999, '1.2.3.4', null, null);

    $this->assertDatabaseCount('short_url_visits', 0);
});
