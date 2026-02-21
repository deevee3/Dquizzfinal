import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

interface Quiz {
    id: number;
    title: string;
    slug: string;
}

interface CampaignCreateProps {
    quizzes: Quiz[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Campaigns', href: '/campaigns' },
    { title: 'Create', href: '/campaigns/create' },
];

export default function CampaignCreate({ quizzes }: CampaignCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        trigger_quiz_id: '' as string | number,
        from_name: '',
        from_email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/campaigns');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Campaign" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Create New Campaign</h1>
                    <p className="text-muted-foreground">Set up an email sequence with linked quizzes</p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Details</CardTitle>
                            <CardDescription>Basic information about your campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Welcome Series"
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of your campaign..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trigger Quiz</CardTitle>
                            <CardDescription>
                                Select which quiz will trigger this campaign when completed
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Quiz (Lead Magnet)</Label>
                                <Select
                                    value={data.trigger_quiz_id?.toString() || ''}
                                    onValueChange={(value) => setData('trigger_quiz_id', value ? parseInt(value) : '')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a quiz to trigger this campaign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {quizzes.map((quiz) => (
                                            <SelectItem key={quiz.id} value={quiz.id.toString()}>
                                                {quiz.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    When someone completes this quiz and provides their email, they'll automatically be added to this campaign.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sender Settings</CardTitle>
                            <CardDescription>Configure who the emails appear to be from</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="from_name">From Name (optional)</Label>
                                    <Input
                                        id="from_name"
                                        value={data.from_name}
                                        onChange={(e) => setData('from_name', e.target.value)}
                                        placeholder="e.g., John from Company"
                                    />
                                    {errors.from_name && <p className="text-sm text-destructive">{errors.from_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="from_email">From Email (optional)</Label>
                                    <Input
                                        id="from_email"
                                        type="email"
                                        value={data.from_email}
                                        onChange={(e) => setData('from_email', e.target.value)}
                                        placeholder="e.g., hello@company.com"
                                    />
                                    {errors.from_email && <p className="text-sm text-destructive">{errors.from_email}</p>}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Leave empty to use your default sender settings.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Campaign
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
