import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, Trash2 } from 'lucide-react';

interface Answer {
    question: string;
    answer: string;
    score: number;
}

interface Submission {
    id: number;
    total_score: number;
    dimension_scores: Record<string, number> | null;
    outcome: string | null;
    submitted_at: string | null;
    answers: Answer[];
}

interface Lead {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string;
    phone: string | null;
    metadata: Record<string, unknown> | null;
    quiz: {
        id: number;
        title: string;
    };
    created_at: string;
    submissions: Submission[];
}

interface LeadShowProps {
    lead: Lead;
}

export default function LeadShow({ lead }: LeadShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Leads', href: '/leads' },
        { title: lead.full_name, href: `/leads/${lead.id}` },
    ];

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${lead.email}?`)) {
            router.delete(`/leads/${lead.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lead: ${lead.full_name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/leads">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{lead.full_name}</h1>
                            <p className="text-muted-foreground">
                                From quiz:{' '}
                                <Link href={`/quizzes/${lead.quiz.id}/edit`} className="hover:underline">
                                    {lead.quiz.title}
                                </Link>
                            </p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Lead
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${lead.email}`} className="hover:underline">
                                    {lead.email}
                                </a>
                            </div>
                            {lead.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${lead.phone}`} className="hover:underline">
                                        {lead.phone}
                                    </a>
                                </div>
                            )}
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Captured on {lead.created_at}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submissions */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Submissions</CardTitle>
                                <CardDescription>
                                    {lead.submissions.length} submission(s) from this lead
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {lead.submissions.length > 0 ? (
                                    <div className="space-y-6">
                                        {lead.submissions.map((submission) => (
                                            <div key={submission.id} className="border-b pb-6 last:border-0 last:pb-0">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-semibold">
                                                                Score: {submission.total_score}
                                                            </span>
                                                            {submission.outcome && (
                                                                <Badge>{submission.outcome}</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {submission.submitted_at}
                                                        </p>
                                                    </div>
                                                </div>

                                                {submission.dimension_scores && (
                                                    <div className="mb-4 flex flex-wrap gap-2">
                                                        {Object.entries(submission.dimension_scores).map(
                                                            ([dimension, score]) => (
                                                                <Badge key={dimension} variant="outline">
                                                                    {dimension}: {score}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                {submission.answers.length > 0 && (
                                                    <div className="rounded-lg bg-muted/50 p-4">
                                                        <h4 className="mb-3 font-medium">Answers</h4>
                                                        <div className="space-y-3">
                                                            {submission.answers.map((answer, index) => (
                                                                <div key={index}>
                                                                    <p className="text-sm font-medium">
                                                                        {answer.question}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {answer.answer}{' '}
                                                                        {answer.score > 0 && (
                                                                            <span className="text-xs">
                                                                                (+{answer.score})
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No completed submissions yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
