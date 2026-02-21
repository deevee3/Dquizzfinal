import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Subscription {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string;
    status: 'active' | 'paused' | 'completed' | 'unsubscribed';
    current_step: number | null;
    subscribed_at: string | null;
    next_send_at: string | null;
}

interface PaginatedSubscriptions {
    data: Subscription[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Campaign {
    id: number;
    name: string;
    status: string;
    trigger_quiz_id: number | null;
}

interface EligibleLead {
    id: number;
    email: string;
    full_name: string;
}

interface SubscriptionsProps {
    campaign: Campaign;
    subscriptions: PaginatedSubscriptions;
    eligibleLeads: EligibleLead[];
}

const statusColors = {
    active: 'default',
    paused: 'outline',
    completed: 'secondary',
    unsubscribed: 'destructive',
} as const;

export default function CampaignSubscriptions({ campaign, subscriptions, eligibleLeads }: SubscriptionsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Campaigns', href: '/campaigns' },
        { title: campaign.name, href: `/campaigns/${campaign.id}/edit` },
        { title: 'Subscribers', href: `/campaigns/${campaign.id}/subscriptions` },
    ];

    const [addOpen, setAddOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        lead_id: '',
    });

    const handleAddSubscriber = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/campaigns/${campaign.id}/subscriptions`, {
            onSuccess: () => {
                setAddOpen(false);
                reset();
            },
        });
    };

    const handleRemove = (subscriptionId: number) => {
        if (confirm('Are you sure you want to remove this subscriber?')) {
            router.delete(`/campaigns/${campaign.id}/subscriptions/${subscriptionId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${campaign.name} - Subscribers`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Subscribers</h1>
                        <p className="text-muted-foreground">
                            Manage subscribers for {campaign.name}
                        </p>
                    </div>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subscriber
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Subscriber</DialogTitle>
                                <DialogDescription>
                                    Select a lead from the trigger quiz to add as a subscriber.
                                </DialogDescription>
                            </DialogHeader>
                            {eligibleLeads.length > 0 ? (
                                <form onSubmit={handleAddSubscriber} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_id">Select Lead</Label>
                                        <select
                                            id="lead_id"
                                            value={data.lead_id}
                                            onChange={(e) => setData('lead_id', e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select a lead...</option>
                                            {eligibleLeads.map((lead) => (
                                                <option key={lead.id} value={lead.id}>
                                                    {lead.full_name} ({lead.email})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.lead_id && <p className="text-sm text-destructive">{errors.lead_id}</p>}
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={processing || !data.lead_id}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Add Subscriber
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div className="py-4 text-center text-muted-foreground">
                                    {campaign.trigger_quiz_id 
                                        ? 'No eligible leads available. All leads from the trigger quiz are already subscribed.'
                                        : 'No trigger quiz is set for this campaign. Set a trigger quiz to add subscribers.'}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                {subscriptions.data.length > 0 ? (
                    <div className="space-y-3">
                        {subscriptions.data.map((sub) => (
                            <Card key={sub.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{sub.full_name}</span>
                                            <Badge variant={statusColors[sub.status]}>{sub.status}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{sub.email}</span>
                                            {sub.current_step && <span>Step {sub.current_step}</span>}
                                            {sub.subscribed_at && <span>Subscribed {sub.subscribed_at}</span>}
                                            {sub.next_send_at && <span>Next email: {sub.next_send_at}</span>}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemove(sub.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {subscriptions.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {subscriptions.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No subscribers yet</h3>
                            <p className="mb-4 text-muted-foreground">
                                Add subscribers to start sending them your campaign emails.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
