import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Quizzes', href: '/quizzes' },
    { title: 'Create', href: '/quizzes/create' },
];

const quizTypes = [
    { value: 'assessment', label: 'Assessment', description: 'Evaluate knowledge or skills' },
    { value: 'scorecard', label: 'Scorecard', description: 'Calculate a score across dimensions' },
    { value: 'profile', label: 'Profile Quiz', description: 'Determine user persona or type' },
    { value: 'survey', label: 'Survey', description: 'Collect feedback or opinions' },
    { value: 'waitlist', label: 'Waitlist', description: 'Qualify leads for a waitlist' },
];

const leadCaptureModes = [
    { value: 'required', label: 'Required', description: 'Users must provide contact info' },
    { value: 'optional', label: 'Optional', description: 'Users can skip the form' },
    { value: 'disabled', label: 'Disabled', description: 'No lead capture form' },
];

export default function QuizzesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        type: 'assessment',
        lead_capture_mode: 'required',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/quizzes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Quiz" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Create New Quiz</h1>
                    <p className="text-muted-foreground">Set up the basics for your new quiz funnel</p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Details</CardTitle>
                            <CardDescription>Basic information about your quiz</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Quiz Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Marketing Maturity Assessment"
                                    required
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of your quiz..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Type</CardTitle>
                            <CardDescription>Choose the type of quiz you want to create</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {quizTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
                                            data.type === type.value ? 'border-primary bg-accent' : ''
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type.value}
                                            checked={data.type === type.value}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{type.label}</div>
                                            <div className="text-sm text-muted-foreground">{type.description}</div>
                                        </div>
                                        {data.type === type.value && (
                                            <div className="h-4 w-4 rounded-full bg-primary" />
                                        )}
                                    </label>
                                ))}
                            </div>
                            {errors.type && <p className="mt-2 text-sm text-destructive">{errors.type}</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Capture</CardTitle>
                            <CardDescription>How do you want to collect contact information?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={data.lead_capture_mode}
                                onValueChange={(value) => setData('lead_capture_mode', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {leadCaptureModes.map((mode) => (
                                        <SelectItem key={mode.value} value={mode.value}>
                                            <div>
                                                <div className="font-medium">{mode.label}</div>
                                                <div className="text-xs text-muted-foreground">{mode.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.lead_capture_mode && (
                                <p className="mt-2 text-sm text-destructive">{errors.lead_capture_mode}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Quiz
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
