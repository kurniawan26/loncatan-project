<?php

test('unknown route returns 404 inertia error page', function () {
    $this->get('/this-route-does-not-exist')
        ->assertStatus(404)
        ->assertInertia(fn ($page) => $page
            ->component('error')
            ->where('status', 404)
        );
});

test('method not allowed is remapped to 404 inertia error page', function () {
    $this->post('/links/some-slug')
        ->assertStatus(404)
        ->assertInertia(fn ($page) => $page
            ->component('error')
            ->where('status', 404)
        );
});
