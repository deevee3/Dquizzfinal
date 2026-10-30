<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('inertia checkout post redirects externally to stripe', function () {
    $user = User::factory()->create();
    $priceId = env('VITE_STRIPE_STARTER_MONTHLY_PRICE_ID');

    $response = $this->actingAs($user)
        ->withHeaders(['X-Inertia' => 'true'])
        ->post('/billing/checkout', ['price_id' => $priceId]);

    // Inertia external redirect: 409 + X-Inertia-Location to Stripe.
    // (A plain 303 here is the old bug: the XHR swallows it.)
    $response->assertStatus(409);
    $location = $response->headers->get('X-Inertia-Location');
    expect($location)->toStartWith('https://checkout.stripe.com/');
});

test('already subscribed user is not sent to a second checkout', function () {
    $user = User::factory()->create();
    DB::table('subscriptions')->insert([
        'user_id' => $user->id,
        'type' => 'default',
        'stripe_id' => 'sub_test_existing',
        'stripe_status' => 'active',
        'stripe_price' => env('VITE_STRIPE_STARTER_MONTHLY_PRICE_ID'),
        'quantity' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->withHeaders(['X-Inertia' => 'true'])
        ->post('/billing/checkout', ['price_id' => env('VITE_STRIPE_PRO_MONTHLY_PRICE_ID')]);

    $response->assertRedirect('/subscription');
});
