import Heading from '@/components/heading';
import TestModeBanner from '@/components/test-mode-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CreditCard, FileText } from 'lucide-react';

export interface SubscriptionState {
    plan_name: string | null;
    interval: 'monthly' | 'annual' | null;
    status: string;
    active: boolean;
    on_trial: boolean;
    trial_ends_at: string | null;
    cancelled: boolean;
    on_grace_period: boolean;
    ends_at: string | null;
    renews_at: string | null;
    started_at: string | null;
    quantity: number | null;
}

interface BillingIndexProps {
    stripeConfigured: boolean;
    subscription: SubscriptionState | null;
    paymentMethod: { type: string; last_four: string | null } | null;
    invoices: { id: string; date: string; total: string; status: string | null; url: string | null }[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Billing', href: '/billing' }];

function statusLabel(subscription: SubscriptionState): string {
    if (subscription.on_grace_period) return 'Cancels at period end';
    if (subscription.cancelled) return 'Cancelled';
    if (subscription.on_trial) return 'Trial';
    if (subscription.active) return 'Active';
    return subscription.status.replace(/_/g, ' ');
}

export default function BillingIndex({ stripeConfigured, subscription, paymentMethod, invoices }: BillingIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <Heading title="Billing" description="Your plan, payment method, and invoices" />

                {!stripeConfigured && <TestModeBanner />}

                {/* Current plan */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current plan</CardTitle>
                        <CardDescription>
                            {subscription ? 'Your subscription, as recorded on your account' : 'You are not subscribed yet'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription ? (
                            <>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-2xl font-bold">{subscription.plan_name ?? 'Subscription'}</span>
                                    {subscription.interval && (
                                        <span className="text-sm text-muted-foreground">billed {subscription.interval}</span>
                                    )}
                                    <Badge variant={subscription.active ? 'default' : 'secondary'}>{statusLabel(subscription)}</Badge>
                                </div>
                                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                    {subscription.started_at && (
                                        <div>
                                            <dt className="text-muted-foreground">Subscribed since</dt>
                                            <dd className="font-medium">{subscription.started_at}</dd>
                                        </div>
                                    )}
                                    {subscription.on_trial && subscription.trial_ends_at && (
                                        <div>
                                            <dt className="text-muted-foreground">Trial ends</dt>
                                            <dd className="font-medium">{subscription.trial_ends_at}</dd>
                                        </div>
                                    )}
                                    {subscription.renews_at && (
                                        <div>
                                            <dt className="text-muted-foreground">Next renewal</dt>
                                            <dd className="font-medium">{subscription.renews_at}</dd>
                                        </div>
                                    )}
                                    {subscription.ends_at && (
                                        <div>
                                            <dt className="text-muted-foreground">Access until</dt>
                                            <dd className="font-medium">{subscription.ends_at}</dd>
                                        </div>
                                    )}
                                </dl>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <Link href="/subscription">
                                        <Button className="bg-[#F48D5C] text-white hover:bg-[#E85D04]">Manage subscription</Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Pick a plan to unlock quiz building, lead capture, and campaigns.
                                </p>
                                <Link href="/subscription">
                                    <Button className="bg-[#F48D5C] text-white hover:bg-[#E85D04]">See plans</Button>
                                </Link>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Payment method */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment method</CardTitle>
                        <CardDescription>The card Stripe charges for your subscription</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {paymentMethod ? (
                            <div className="flex items-center gap-3 text-sm">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium capitalize">{paymentMethod.type}</span>
                                {paymentMethod.last_four && <span className="text-muted-foreground">•••• {paymentMethod.last_four}</span>}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No payment method on file.</p>
                        )}
                        {stripeConfigured ? (
                            <a href="/billing/portal">
                                <Button variant="outline">Update payment method</Button>
                            </a>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Payment details are managed through Stripe — available once payments are connected.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Invoices */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoices</CardTitle>
                        <CardDescription>Your most recent subscription invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.length > 0 ? (
                            <ul className="divide-y text-sm">
                                {invoices.map((invoice) => (
                                    <li key={invoice.id} className="flex items-center justify-between py-3">
                                        <span className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {invoice.date}
                                        </span>
                                        <span className="flex items-center gap-4">
                                            {invoice.status && <span className="text-muted-foreground capitalize">{invoice.status}</span>}
                                            <span className="font-medium">{invoice.total}</span>
                                            {invoice.url && (
                                                <a href={invoice.url} target="_blank" rel="noreferrer" className="font-medium text-[#E85D04] hover:underline">
                                                    View
                                                </a>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {stripeConfigured
                                    ? 'No invoices yet — they will show up here after your first payment.'
                                    : 'Invoices will show up here once payments are connected and your first payment goes through.'}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
