import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Mail, MousePointerClick, Users, Eye } from 'lucide-react';

interface Campaign {
    id: number;
    name: string;
    status: string;
}

interface Stats {
    total_subscribers: number;
    active_subscribers: number;
    total_emails_sent: number;
    total_opens: number;
    total_clicks: number;
    open_rate: number;
}

interface CampaignAnalyticsProps {
    campaign: Campaign;
    stats: Stats;
}

export default function CampaignAnalytics({ campaign, stats }: CampaignAnalyticsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Campaigns', href: '/campaigns' },
        { title: campaign.name, href: `/campaigns/${campaign.id}/edit` },
        { title: 'Analytics', href: `/campaigns/${campaign.id}/analytics` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${campaign.name} - Analytics`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">{campaign.name} Analytics</h1>
                    <p className="text-muted-foreground">Track the performance of your campaign</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_subscribers}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_subscribers} active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_emails_sent}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Opens</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_opens}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.open_rate}% open rate
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_clicks}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
