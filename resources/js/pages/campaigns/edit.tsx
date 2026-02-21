import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Clock, FileText, Loader2, Mail, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    slug: string;
}

interface Step {
    id: number;
    order: number;
    type: 'email' | 'quiz' | 'delay';
    subject: string | null;
    email_content: string | null;
    delay_days: number;
    delay_hours: number;
    quiz_id: number | null;
    quiz: Quiz | null;
}

interface Campaign {
    id: number;
    name: string;
    description: string | null;
    status: 'draft' | 'active' | 'paused' | 'completed';
    trigger_quiz_id: number | null;
    from_name: string | null;
    from_email: string | null;
    steps: Step[];
}

interface CampaignEditProps {
    campaign: Campaign;
    quizzes: Quiz[];
}

export default function CampaignEdit({ campaign, quizzes }: CampaignEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Campaigns', href: '/campaigns' },
        { title: campaign.name, href: `/campaigns/${campaign.id}/edit` },
    ];

    const [addStepOpen, setAddStepOpen] = useState(false);

    const settingsForm = useForm({
        name: campaign.name,
        description: campaign.description ?? '',
        trigger_quiz_id: campaign.trigger_quiz_id ?? ('' as number | string),
        from_name: campaign.from_name ?? '',
        from_email: campaign.from_email ?? '',
    });

    const stepForm = useForm({
        type: 'email' as 'email' | 'quiz' | 'delay',
        subject: '',
        email_content: '',
        quiz_id: '',
        delay_days: 0,
        delay_hours: 0,
    });

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.put(`/campaigns/${campaign.id}`);
    };

    const handleAddStep = (e: React.FormEvent) => {
        e.preventDefault();
        stepForm.post(`/campaigns/${campaign.id}/steps`, {
            onSuccess: () => {
                setAddStepOpen(false);
                stepForm.reset();
            },
        });
    };

    const handleDeleteStep = (stepId: number) => {
        if (confirm('Are you sure you want to delete this step?')) {
            router.delete(`/campaigns/${campaign.id}/steps/${stepId}`);
        }
    };

    const handleStatusChange = (status: string) => {
        router.patch(`/campaigns/${campaign.id}/status`, { status });
    };

    const getStepIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'quiz':
                return <FileText className="h-4 w-4" />;
            case 'delay':
                return <Clock className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${campaign.name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{campaign.name}</h1>
                        <div className="flex items-center gap-2">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                {campaign.status}
                            </Badge>
                            <span className="text-muted-foreground">{campaign.steps.length} steps</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                            <Button onClick={() => handleStatusChange('active')}>Activate Campaign</Button>
                        )}
                        {campaign.status === 'active' && (
                            <Button variant="outline" onClick={() => handleStatusChange('paused')}>
                                Pause
                            </Button>
                        )}
                        {campaign.status === 'paused' && (
                            <Button onClick={() => handleStatusChange('active')}>Resume</Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="steps" className="w-full">
                    <TabsList>
                        <TabsTrigger value="steps">Steps</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="steps" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-muted-foreground">
                                Build your email sequence by adding steps below.
                            </p>
                            <Dialog open={addStepOpen} onOpenChange={setAddStepOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Step
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add Step</DialogTitle>
                                        <DialogDescription>
                                            Add a new step to your campaign sequence.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddStep} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Step Type</Label>
                                            <Select
                                                value={stepForm.data.type}
                                                onValueChange={(value: 'email' | 'quiz' | 'delay') =>
                                                    stepForm.setData('type', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="quiz">Send Quiz Link</SelectItem>
                                                    <SelectItem value="delay">Wait/Delay</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {stepForm.data.type === 'email' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subject">Subject</Label>
                                                    <Input
                                                        id="subject"
                                                        value={stepForm.data.subject}
                                                        onChange={(e) => stepForm.setData('subject', e.target.value)}
                                                        placeholder="Email subject line"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email_content">Email Content</Label>
                                                    <textarea
                                                        id="email_content"
                                                        value={stepForm.data.email_content}
                                                        onChange={(e) =>
                                                            stepForm.setData('email_content', e.target.value)
                                                        }
                                                        placeholder="Write your email content here. Use {{first_name}}, {{last_name}}, {{email}} for personalization."
                                                        className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {stepForm.data.type === 'quiz' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>Select Quiz</Label>
                                                    <Select
                                                        value={stepForm.data.quiz_id}
                                                        onValueChange={(value) => stepForm.setData('quiz_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose a quiz" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {quizzes.map((quiz) => (
                                                                <SelectItem key={quiz.id} value={quiz.id.toString()}>
                                                                    {quiz.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="quiz_subject">Subject</Label>
                                                    <Input
                                                        id="quiz_subject"
                                                        value={stepForm.data.subject}
                                                        onChange={(e) => stepForm.setData('subject', e.target.value)}
                                                        placeholder="Check out this quiz!"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="quiz_content">Email Content</Label>
                                                    <textarea
                                                        id="quiz_content"
                                                        value={stepForm.data.email_content}
                                                        onChange={(e) =>
                                                            stepForm.setData('email_content', e.target.value)
                                                        }
                                                        placeholder="Use {{quiz_url}} and {{quiz_title}} to include quiz link."
                                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-2">
                                            <Label>Delay Before This Step</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label htmlFor="delay_days" className="text-xs">
                                                        Days
                                                    </Label>
                                                    <Input
                                                        id="delay_days"
                                                        type="number"
                                                        min="0"
                                                        value={stepForm.data.delay_days}
                                                        onChange={(e) =>
                                                            stepForm.setData('delay_days', parseInt(e.target.value) || 0)
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="delay_hours" className="text-xs">
                                                        Hours
                                                    </Label>
                                                    <Input
                                                        id="delay_hours"
                                                        type="number"
                                                        min="0"
                                                        max="23"
                                                        value={stepForm.data.delay_hours}
                                                        onChange={(e) =>
                                                            stepForm.setData('delay_hours', parseInt(e.target.value) || 0)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button type="submit" disabled={stepForm.processing}>
                                                {stepForm.processing && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Add Step
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Steps List */}
                        {campaign.steps.length > 0 ? (
                            <div className="space-y-3">
                                {campaign.steps.map((step, index) => (
                                    <Card key={step.id}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    {index + 1}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStepIcon(step.type)}
                                                    <span className="font-medium capitalize">{step.type}</span>
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {step.type === 'email' && step.subject}
                                                    {step.type === 'quiz' && step.quiz?.title}
                                                    {step.type === 'delay' &&
                                                        `Wait ${step.delay_days}d ${step.delay_hours}h`}
                                                </div>
                                                {(step.delay_days > 0 || step.delay_hours > 0) &&
                                                    step.type !== 'delay' && (
                                                        <Badge variant="outline">
                                                            After {step.delay_days}d {step.delay_hours}h
                                                        </Badge>
                                                    )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteStep(step.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <Mail className="h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mt-4 text-lg font-semibold">No steps yet</h3>
                                    <p className="mb-4 text-muted-foreground">
                                        Add your first step to start building your campaign sequence.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="max-w-2xl space-y-6">
                        <form onSubmit={handleSettingsSubmit} className="space-y-6">
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
                                            value={settingsForm.data.name}
                                            onChange={(e) => settingsForm.setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={settingsForm.data.description}
                                            onChange={(e) => settingsForm.setData('description', e.target.value)}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Trigger Quiz</CardTitle>
                                    <CardDescription>
                                        The quiz that triggers this campaign when completed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Quiz (Lead Magnet)</Label>
                                        <Select
                                            value={settingsForm.data.trigger_quiz_id?.toString() || ''}
                                            onValueChange={(value) =>
                                                settingsForm.setData('trigger_quiz_id', value ? parseInt(value) : '')
                                            }
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
                                            When someone completes this quiz and provides their email, they'll
                                            automatically be added to this campaign.
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
                                            <Label htmlFor="from_name">From Name</Label>
                                            <Input
                                                id="from_name"
                                                value={settingsForm.data.from_name}
                                                onChange={(e) => settingsForm.setData('from_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="from_email">From Email</Label>
                                            <Input
                                                id="from_email"
                                                type="email"
                                                value={settingsForm.data.from_email}
                                                onChange={(e) => settingsForm.setData('from_email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button type="submit" disabled={settingsForm.processing}>
                                {settingsForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Settings
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
