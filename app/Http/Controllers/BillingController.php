<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    /**
     * Redirect to Stripe Checkout for subscription.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'price_id' => 'required|string',
        ]);

        return $request->user()
            ->newSubscription('default', $request->price_id)
            ->checkout([
                'success_url' => route('billing.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('pricing'),
            ]);
    }

    /**
     * Handle successful checkout.
     */
    public function success(Request $request)
    {
        return Inertia::render('billing/success');
    }

    /**
     * Redirect to Stripe Customer Portal.
     */
    public function portal(Request $request)
    {
        return $request->user()->redirectToBillingPortal(route('dashboard'));
    }

    /**
     * Show the subscription page for users who need to subscribe.
     */
    public function subscribe()
    {
        return Inertia::render('billing/subscribe');
    }
}
