import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Edit, Mail, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react';

interface TriggerQuiz {
    id: number;
    title: string;
    slug: string;
}

interface Campaign {
    id: number;
    name: string;
    description: string | null;
    status: 'draft' | 'active' | 'paused' | 'completed';
    trigger_quiz: TriggerQuiz | null;
    steps_count: number;
    subscriptions_count: number;
    emails_count: number;
    created_at: string;
}

interface PaginatedCampaigns {
    data: Campaign[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface CampaignsIndexProps {
    campaigns: PaginatedCampaigns;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Campaigns', href: '/campaigns' },
];

const statusColors = {
    draft: 'secondary',
    active: 'default',
    paused: 'outline',
    completed: 'secondary',
} as const;

export default function CampaignsIndex({ campaigns }: CampaignsIndexProps) {
    const handleDelete = (campaign: Campaign) => {
        if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
            router.delete(`/campaigns/${campaign.id}`);
        }
    };

    const handleStatusChange = (campaign: Campaign, status: string) => {
        router.patch(`/campaigns/${campaign.id}/status`, { status });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campaigns" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Campaigns</h1>
                        <p className="text-muted-foreground">Create email sequences with linked quizzes</p>
                    </div>
                    <Button asChild>
                        <Link href="/campaigns/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Campaign
                        </Link>
                    </Button>
                </div>

                {/* Campaign List */}
                {campaigns.data.length > 0 ? (
                    <div className="grid gap-4">
                        {campaigns.data.map((campaign) => (
                            <Card key={campaign.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/campaigns/${campaign.id}/edit`}
                                                className="font-semibold hover:underline"
                                            >
                                                {campaign.name}
                                            </Link>
                                            <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                                            {campaign.trigger_quiz && (
                                                <Badge variant="outline" className="text-xs">
                                                    Trigger: {campaign.trigger_quiz.title}
                                                </Badge>
                                            )}
                                        </div>
                                        {campaign.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {campaign.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{campaign.steps_count} steps</span>
                                            <span>{campaign.subscriptions_count} subscribers</span>
                                            <span>{campaign.emails_count} emails sent</span>
                                            <span>Created {campaign.created_at}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/campaigns/${campaign.id}/subscriptions`}>
                                                <Users className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/campaigns/${campaign.id}/analytics`}>
                                                <BarChart3 className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/campaigns/${campaign.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {campaign.status === 'draft' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(campaign, 'active')}>
                                                        Activate
                                                    </DropdownMenuItem>
                                                )}
                                                {campaign.status === 'active' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(campaign, 'paused')}>
                                                        Pause
                                                    </DropdownMenuItem>
                                                )}
                                                {campaign.status === 'paused' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(campaign, 'active')}>
                                                        Resume
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(campaign)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {campaigns.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {campaigns.links.map((link, index) => (
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
                            <Mail className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
                            <p className="mb-4 text-muted-foreground">
                                Create your first campaign to start sending email sequences with quizzes.
                            </p>
                            <Button asChild>
                                <Link href="/campaigns/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Campaign
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
