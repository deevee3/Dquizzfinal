<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    /**
     * The plans on offer. Price IDs come from the environment (the same
     * VITE_STRIPE_* variables the subscribe/pricing pages render with);
     * amounts mirror pricing.tsx and billing/subscribe.tsx.
     */
    private function plans(): array
    {
        return [
            [
                'name' => 'Starter',
                'description' => 'Perfect for getting started',
                'monthly_price_id' => env('VITE_STRIPE_STARTER_MONTHLY_PRICE_ID'),
                'annual_price_id' => env('VITE_STRIPE_STARTER_ANNUAL_PRICE_ID'),
                'monthly_price' => 29,
                'annual_price' => 21,
                'popular' => false,
                'features' => [
                    '1 Published Quiz',
                    '100 Leads / month',
                    'Basic Analytics',
                    'Standard Templates',
                    'Email Support',
                ],
            ],
            [
                'name' => 'Pro',
                'description' => 'For serious marketers',
                'monthly_price_id' => env('VITE_STRIPE_PRO_MONTHLY_PRICE_ID'),
                'annual_price_id' => env('VITE_STRIPE_PRO_ANNUAL_PRICE_ID'),
                'monthly_price' => 99,
                'annual_price' => 72,
                'popular' => true,
                'features' => [
                    'Unlimited Quizzes',
                    '1,000 Leads / month',
                    'Advanced Analytics',
                    'Premium Templates',
                    'Remove Branding',
                    'Priority Support',
                ],
            ],
            [
                'name' => 'Agency',
                'description' => 'Scale your operations',
                'monthly_price_id' => env('VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID'),
                'annual_price_id' => env('VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID'),
                'monthly_price' => 399,
                'annual_price' => 291,
                'popular' => false,
                'features' => [
                    'Everything in Pro',
                    'Unlimited Leads',
                    'Team Collaboration',
                    'Client Management',
                    'Custom Domain',
                    'Dedicated Success Manager',
                ],
            ],
        ];
    }

    /**
     * Payments are only live when a Stripe secret is configured. Until
     * D'Vaughn connects his Stripe account, every billing page runs in a
     * clearly labeled test mode and nothing can charge.
     */
    private function stripeConfigured(): bool
    {
        return ! empty(config('cashier.secret'));
    }

    /**
     * The signed-in user's real subscription state, read from the app's own
     * Cashier tables — no Stripe API call is needed for any of this except
     * the renewal date, which Stripe does not store locally.
     */
    private function subscriptionState(User $user): ?array
    {
        $subscription = $user->subscription('default');

        if (! $subscription) {
            return null;
        }

        $planName = null;
        $interval = null;
        foreach ($this->plans() as $plan) {
            if ($subscription->stripe_price === $plan['monthly_price_id']) {
                $planName = $plan['name'];
                $interval = 'monthly';
                break;
            }
            if ($subscription->stripe_price === $plan['annual_price_id']) {
                $planName = $plan['name'];
                $interval = 'annual';
                break;
            }
        }

        // Renewal date is not in the local Cashier tables; fetch it from
        // Stripe only when payments are actually connected.
        $renewsAt = null;
        if ($this->stripeConfigured() && $subscription->active() && ! $subscription->cancelled()) {
            try {
                $stripeSubscription = $subscription->asStripeSubscription();
                if (! empty($stripeSubscription->current_period_end)) {
                    $renewsAt = Carbon::createFromTimestamp($stripeSubscription->current_period_end)
                        ->format('M d, Y');
                }
            } catch (\Throwable $e) {
                $renewsAt = null;
            }
        }

        return [
            'plan_name' => $planName,
            'interval' => $interval,
            'status' => $subscription->stripe_status,
            'active' => $subscription->active(),
            'on_trial' => $subscription->onTrial(),
            'trial_ends_at' => $subscription->trial_ends_at?->format('M d, Y'),
            'cancelled' => $subscription->cancelled(),
            'on_grace_period' => $subscription->onGracePeriod(),
            'ends_at' => $subscription->ends_at?->format('M d, Y'),
            'renews_at' => $renewsAt,
            'started_at' => $subscription->created_at?->format('M d, Y'),
            'quantity' => $subscription->quantity,
        ];
    }

    /**
     * Billing overview: current plan, payment method on file, invoices.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $invoices = [];
        if ($this->stripeConfigured() && $user->hasStripeId()) {
            try {
                $invoices = $user->invoices()->take(5)->map(fn ($invoice) => [
                    'id' => $invoice->asStripeInvoice()->id,
                    'date' => $invoice->date()->format('M d, Y'),
                    'total' => $invoice->total(),
                    'status' => $invoice->asStripeInvoice()->status,
                    'url' => $invoice->asStripeInvoice()->hosted_invoice_url,
                ])->all();
            } catch (\Throwable $e) {
                $invoices = [];
            }
        }

        return Inertia::render('billing/index', [
            'stripeConfigured' => $this->stripeConfigured(),
            'subscription' => $this->subscriptionState($user),
            'paymentMethod' => $user->pm_type ? [
                'type' => $user->pm_type,
                'last_four' => $user->pm_last_four,
            ] : null,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Subscription management: current plan plus the other plans, with
     * payment management via the Stripe customer portal when connected.
     */
    public function subscriptionPage(Request $request)
    {
        $user = $request->user();
        $currentPrice = $user->subscription('default')?->stripe_price;

        $plans = array_map(function ($plan) use ($currentPrice) {
            $plan['current'] = $currentPrice !== null
                && ($currentPrice === $plan['monthly_price_id'] || $currentPrice === $plan['annual_price_id']);

            return $plan;
        }, $this->plans());

        return Inertia::render('billing/subscription', [
            'stripeConfigured' => $this->stripeConfigured(),
            'subscription' => $this->subscriptionState($user),
            'hasStripeCustomer' => $user->hasStripeId(),
            'plans' => $plans,
        ]);
    }

    /**
     * Redirect to Stripe Checkout for subscription.
     */
    public function checkout(Request $request)
    {
        if (! $this->stripeConfigured()) {
            return redirect()->route('billing.index')
                ->with('error', 'Payments are not connected yet — D\'Quizz is running in test mode, so checkout is disabled and nothing can be charged.');
        }

        $request->validate([
            'price_id' => 'required|string',
        ]);

        // Only price IDs from the configured plans may be checked out.
        $allowedPriceIds = collect($this->plans())
            ->flatMap(fn ($plan) => [$plan['monthly_price_id'], $plan['annual_price_id']])
            ->filter()
            ->all();

        if (! in_array($request->price_id, $allowedPriceIds, true)) {
            return redirect()->route('subscription')
                ->with('error', 'That plan is not available for checkout. If this keeps happening, the Stripe prices may not be configured yet.');
        }

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
        if (! $this->stripeConfigured()) {
            return redirect()->route('billing.index')
                ->with('error', 'Payments are not connected yet — D\'Quizz is running in test mode, so there is no payment portal to open.');
        }

        if (! $request->user()->hasStripeId()) {
            return redirect()->route('subscription')
                ->with('error', 'No billing account yet — subscribe to a plan first, then you can manage payment details here.');
        }

        return $request->user()->redirectToBillingPortal(route('billing.index'));
    }

    /**
     * Show the subscription page for users who need to subscribe.
     */
    public function subscribe(Request $request)
    {
        return Inertia::render('billing/subscribe', [
            'stripeConfigured' => $this->stripeConfigured(),
            'subscription' => $this->subscriptionState($request->user()),
        ]);
    }
}
