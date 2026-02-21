import { AppShell } from '@/components/app-shell';
import { Head, router } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

const PLANS = [
    {
        name: 'Starter',
        description: 'Perfect for getting started',
        monthlyPriceId: import.meta.env.VITE_STRIPE_STARTER_MONTHLY_PRICE_ID,
        annualPriceId: import.meta.env.VITE_STRIPE_STARTER_ANNUAL_PRICE_ID,
        monthlyPrice: 29,
        annualPrice: 21,
        features: [
            '1 Published Quiz',
            '100 Leads / month',
            'Basic Analytics',
            'Standard Templates',
            'Email Support',
        ],
    },
    {
        name: 'Pro',
        description: 'For serious marketers',
        monthlyPriceId: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID,
        annualPriceId: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID,
        monthlyPrice: 99,
        annualPrice: 72,
        popular: true,
        features: [
            'Unlimited Quizzes',
            '1,000 Leads / month',
            'Advanced Analytics',
            'Premium Templates',
            'Remove Branding',
            'Priority Support',
        ],
    },
    {
        name: 'Agency',
        description: 'Scale your operations',
        monthlyPriceId: import.meta.env.VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID,
        annualPriceId: import.meta.env.VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID,
        monthlyPrice: 399,
        annualPrice: 291,
        features: [
            'Everything in Pro',
            'Unlimited Leads',
            'Team Collaboration',
            'Client Management',
            'Custom Domain',
            'Dedicated Success Manager',
        ],
    },
];

export default function Subscribe() {
    const [isAnnual, setIsAnnual] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = (plan: (typeof PLANS)[0]) => {
        const priceId = isAnnual ? plan.annualPriceId : plan.monthlyPriceId;
        if (!priceId) {
            alert('Price ID not configured. Please set up Stripe prices.');
            return;
        }
        setLoading(plan.name);
        router.post(
            '/billing/checkout',
            { price_id: priceId },
            {
                onFinish: () => setLoading(null),
            },
        );
    };

    return (
        <AppShell>
            <Head title="Choose Your Plan" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-500">
                        <Sparkles className="h-4 w-4" />
                        SUBSCRIPTION REQUIRED
                    </div>
                    <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Choose your plan to continue</h1>
                    <p className="text-slate-600 dark:text-slate-400">Select a plan to unlock all features and start creating quizzes.</p>

                    {/* Billing Toggle */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={`relative h-7 w-14 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-[#F48D5C]' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span
                                className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            Annual
                            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Save 27%
                            </span>
                        </span>
                    </div>
                </div>

                <div className="grid max-w-5xl gap-6 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                                plan.popular
                                    ? 'z-10 scale-105 border-[#F48D5C] bg-white shadow-2xl shadow-[#F48D5C]/10 dark:bg-slate-800'
                                    : 'border-slate-200 bg-white hover:border-[#F48D5C]/30 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F48D5C] px-3 py-1 text-xs font-bold tracking-wider text-white shadow-lg shadow-[#F48D5C]/30">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                                    </span>
                                    <span className="text-slate-500">/mo{isAnnual && ', billed annually'}</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                            </div>

                            <div className="mb-6 flex-1 space-y-3">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <Check className={`h-5 w-5 shrink-0 ${plan.popular ? 'text-[#F48D5C]' : 'text-slate-400'}`} />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={loading !== null}
                                className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                                    plan.popular
                                        ? 'bg-[#F48D5C] text-white shadow-lg shadow-[#F48D5C]/25 hover:bg-[#E85D04]'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600'
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {loading === plan.name ? 'Redirecting...' : 'Subscribe'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
