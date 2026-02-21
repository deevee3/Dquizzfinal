import { Button } from '@/components/ui/button';
import MarketingLayout from '@/layouts/marketing-layout';
import { login } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

const MONTHLY_PRICES = {
    starter: 29,
    pro: 99,
    agency: 399,
};

const ANNUAL_DISCOUNT = 0.27;

function getAnnualPrice(monthly: number) {
    return Math.round(monthly * (1 - ANNUAL_DISCOUNT));
}

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(false);

    const starterPrice = isAnnual ? getAnnualPrice(MONTHLY_PRICES.starter) : MONTHLY_PRICES.starter;
    const proPrice = isAnnual ? getAnnualPrice(MONTHLY_PRICES.pro) : MONTHLY_PRICES.pro;
    const agencyPrice = isAnnual ? getAnnualPrice(MONTHLY_PRICES.agency) : MONTHLY_PRICES.agency;

    return (
        <MarketingLayout>
            <Head title="Pricing - D'Quizz" />
            
            <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F48D5C]/30 bg-[#FFF5EC] text-[#F48D5C] text-xs font-bold mb-6 uppercase tracking-wider shadow-sm">
                            Pricing
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-slate-900">Simple, transparent pricing</h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Choose the plan that works best for you.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-[#F48D5C]' : 'bg-slate-300'}`}
                            >
                                <span 
                                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}
                                />
                            </button>
                            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                                Annual
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                    Save 27%
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Starter Tier */}
                        <PricingCard 
                            name="Starter"
                            price={`$${starterPrice}`}
                            period={isAnnual ? "/mo, billed annually" : "/mo"}
                            description="Perfect for getting started"
                            features={[
                                "1 Published Quiz",
                                "100 Leads / month",
                                "Basic Analytics",
                                "Standard Templates",
                                "Email Support"
                            ]}
                            cta="Get Started"
                            href={login.url()}
                        />

                        {/* Pro Tier */}
                        <PricingCard 
                            name="Pro"
                            price={`$${proPrice}`}
                            period={isAnnual ? "/mo, billed annually" : "/mo"}
                            description="For serious marketers"
                            features={[
                                "Unlimited Quizzes",
                                "1,000 Leads / month",
                                "Advanced Analytics",
                                "Premium Templates",
                                "Remove Branding",
                                "Priority Support"
                            ]}
                            cta="Get Started"
                            popular
                            href={login.url()}
                        />

                        {/* Agency Tier */}
                        <PricingCard 
                            name="Agency"
                            price={`$${agencyPrice}`}
                            period={isAnnual ? "/mo, billed annually" : "/mo"}
                            description="Scale your operations"
                            features={[
                                "Everything in Pro",
                                "Unlimited Leads",
                                "Team Collaboration",
                                "Client Management",
                                "Custom Domain",
                                "Dedicated Success Manager"
                            ]}
                            cta="Contact Sales"
                            href="/contact"
                            variant="outline"
                        />
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}

function PricingCard({ 
    name, 
    price, 
    period, 
    description, 
    features, 
    cta, 
    popular, 
    href,
    variant = "default"
}: { 
    name: string, 
    price: string, 
    period?: string, 
    description: string, 
    features: string[], 
    cta: string, 
    popular?: boolean,
    href: string,
    variant?: "default" | "outline"
}) {
    return (
        <div className={`relative p-8 rounded-[2rem] border flex flex-col transition-all duration-300 ${popular ? 'bg-white border-[#F48D5C] shadow-2xl shadow-[#F48D5C]/10 scale-105 z-10' : 'bg-white border-slate-100 hover:border-[#F48D5C]/30 hover:shadow-lg'}`}>
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#F48D5C] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#F48D5C]/30">
                    Most Popular
                </div>
            )}
            
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">{price}</span>
                    {period && <span className="text-slate-500 font-medium">{period}</span>}
                </div>
                <p className="text-sm text-slate-500 mt-2">{description}</p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 shrink-0 ${popular ? 'text-[#F48D5C]' : 'text-slate-400'}`} />
                        <span className="text-sm text-slate-600 font-medium">{feature}</span>
                    </div>
                ))}
            </div>

            <Link href={href}>
                <Button 
                    className={`w-full h-12 rounded-xl text-base font-bold transition-all ${popular ? 'bg-[#F48D5C] hover:bg-[#E85D04] text-white shadow-lg shadow-[#F48D5C]/25' : variant === 'outline' ? 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-[#F48D5C] hover:text-[#F48D5C]' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                    {cta}
                </Button>
            </Link>
        </div>
    );
}
