import Heading from '@/components/heading';
import TestModeBanner from '@/components/test-mode-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { type SubscriptionState } from './index';

interface Plan {
    name: string;
    description: string;
    monthly_price_id: string | null;
    annual_price_id: string | null;
    monthly_price: number;
    annual_price: number;
    popular: boolean;
    features: string[];
    current: boolean;
}

interface SubscriptionPageProps {
    stripeConfigured: boolean;
    subscription: SubscriptionState | null;
    hasStripeCustomer: boolean;
    plans: Plan[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Subscription', href: '/subscription' }];

export default function SubscriptionPage({ stripeConfigured, subscription, hasStripeCustomer, plans }: SubscriptionPageProps) {
    const [isAnnual, setIsAnnual] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    const handleSelectPlan = (plan: Plan) => {
        const priceId = isAnnual ? plan.annual_price_id : plan.monthly_price_id;
        if (!stripeConfigured || !priceId) {
            return;
        }
        setLoading(plan.name);
        router.post('/billing/checkout', { price_id: priceId }, { onFinish: () => setLoading(null) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
                <Heading title="Subscription" description="Your current plan, switching, and payment management" />

                {!stripeConfigured && <TestModeBanner />}

                {/* Current state */}
                <Card>
                    <CardHeader>
                        <CardTitle>Where you stand</CardTitle>
                        <CardDescription>Read from your account — this is your real subscription state</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {subscription ? (
                            <>
                                <p>
                                    You&rsquo;re on the{' '}
                                    <span className="font-bold">{subscription.plan_name ?? 'Subscription'}</span>
                                    {subscription.interval && <> plan, billed {subscription.interval}</>}
                                    {subscription.on_trial && subscription.trial_ends_at && (
                                        <>, on trial until {subscription.trial_ends_at}</>
                                    )}
                                    .
                                </p>
                                {subscription.cancelled && subscription.ends_at && (
                                    <p className="text-muted-foreground">
                                        Your subscription is set to cancel — you keep access until {subscription.ends_at}.
                                    </p>
                                )}
                                {subscription.renews_at && (
                                    <p className="text-muted-foreground">Next renewal: {subscription.renews_at}.</p>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground">
                                No subscription yet. Choose a plan below — while payments are in test mode the buttons stay off
                                and nothing can charge you.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-sm font-medium ${!isAnnual ? '' : 'text-muted-foreground'}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className={`relative h-7 w-14 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-[#F48D5C]' : 'bg-slate-300 dark:bg-slate-600'}`}
                        aria-label="Toggle annual billing"
                    >
                        <span
                            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}
                        />
                    </button>
                    <span className={`text-sm font-medium ${isAnnual ? '' : 'text-muted-foreground'}`}>
                        Annual
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Save 27%
                        </span>
                    </span>
                </div>

                {/* Plans */}
                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                                plan.current
                                    ? 'border-[#F48D5C] bg-card shadow-lg'
                                    : plan.popular
                                      ? 'z-10 scale-105 border-[#F48D5C] bg-card shadow-2xl shadow-[#F48D5C]/10'
                                      : 'border-border bg-card hover:border-[#F48D5C]/30 hover:shadow-lg'
                            }`}
                        >
                            {plan.current ? (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E85D04] px-3 py-1 text-xs font-bold tracking-wider text-white shadow-lg">
                                    CURRENT PLAN
                                </div>
                            ) : (
                                plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F48D5C] px-3 py-1 text-xs font-bold tracking-wider text-white shadow-lg shadow-[#F48D5C]/30">
                                        MOST POPULAR
                                    </div>
                                )
                            )}

                            <div className="mb-6">
                                <h3 className="mb-1 text-lg font-bold">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">${isAnnual ? plan.annual_price : plan.monthly_price}</span>
                                    <span className="text-muted-foreground">/mo{isAnnual && ', billed annually'}</span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            <div className="mb-6 flex-1 space-y-3">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <Check className={`h-5 w-5 shrink-0 ${plan.popular || plan.current ? 'text-[#F48D5C]' : 'text-slate-400'}`} />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={plan.current || !stripeConfigured || loading !== null}
                                className={
                                    plan.current || !stripeConfigured
                                        ? ''
                                        : plan.popular
                                          ? 'bg-[#F48D5C] text-white shadow-lg shadow-[#F48D5C]/25 hover:bg-[#E85D04]'
                                          : ''
                                }
                            >
                                {plan.current
                                    ? 'Current plan'
                                    : !stripeConfigured
                                      ? 'Available when payments connect'
                                      : loading === plan.name
                                        ? 'Redirecting...'
                                        : subscription
                                          ? `Switch to ${plan.name}`
                                          : `Subscribe to ${plan.name}`}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Payment management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment management</CardTitle>
                        <CardDescription>Update your card, download invoices, or cancel — handled by Stripe</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {stripeConfigured && hasStripeCustomer ? (
                            <a href="/billing/portal">
                                <Button variant="outline">Open payment portal</Button>
                            </a>
                        ) : (
                            <>
                                <Button variant="outline" disabled>
                                    Open payment portal
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    {!stripeConfigured
                                        ? 'The payment portal opens once a Stripe account is connected.'
                                        : 'The payment portal becomes available after your first subscription.'}
                                </p>
                            </>
                        )}
                        {subscription?.cancelled && (
                            <p className="text-xs text-muted-foreground">
                                <Badge variant="secondary">Cancelling</Badge> To undo a cancellation before{' '}
                                {subscription.ends_at ?? 'the period ends'}, resume from the payment portal.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
