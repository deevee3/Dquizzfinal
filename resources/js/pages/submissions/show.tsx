import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Mail, Phone, User } from 'lucide-react';

interface Answer {
    id: number;
    question_text: string;
    question_type: string;
    answer_value: string | null;
    answer_option_ids: number[] | null;
    score_value: number;
    selected_options: string[];
}

interface Submission {
    id: number;
    quiz: {
        id: number;
        title: string;
    };
    lead: {
        id: number;
        email: string;
        full_name: string;
        phone: string | null;
    } | null;
    total_score: number;
    dimension_scores: Record<string, number> | null;
    outcome: {
        name: string;
        description: string;
    } | null;
    started_at: string | null;
    submitted_at: string | null;
    answers: Answer[];
}

interface SubmissionShowProps {
    submission: Submission;
}

export default function SubmissionShow({ submission }: SubmissionShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Responses', href: '/submissions' },
        { title: `#${submission.id}`, href: `/submissions/${submission.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Response #${submission.id}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/submissions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Response #{submission.id}</h1>
                        <p className="text-muted-foreground">
                            Quiz:{' '}
                            <Link href={`/quizzes/${submission.quiz.id}/edit`} className="hover:underline">
                                {submission.quiz.title}
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Score & Result */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Result</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold">{submission.total_score}</div>
                                <p className="text-sm text-muted-foreground">Total Score</p>
                            </div>

                            {submission.outcome && (
                                <div className="rounded-lg bg-muted p-4 text-center">
                                    <Badge className="mb-2">{submission.outcome.name}</Badge>
                                    <p className="text-sm text-muted-foreground">{submission.outcome.description}</p>
                                </div>
                            )}

                            {submission.dimension_scores && Object.keys(submission.dimension_scores).length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Dimension Scores</p>
                                    {Object.entries(submission.dimension_scores).map(([dimension, score]) => (
                                        <div key={dimension} className="flex items-center justify-between">
                                            <span className="text-sm">{dimension}</span>
                                            <span className="font-medium">{score}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Submitted {submission.submitted_at}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {submission.lead ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{submission.lead.full_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${submission.lead.email}`} className="hover:underline">
                                            {submission.lead.email}
                                        </a>
                                    </div>
                                    {submission.lead.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a href={`tel:${submission.lead.phone}`} className="hover:underline">
                                                {submission.lead.phone}
                                            </a>
                                        </div>
                                    )}
                                    <div className="border-t pt-3">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/leads/${submission.lead.id}`}>View Full Lead Profile</Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Anonymous submission</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Answers */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Answers</CardTitle>
                            <CardDescription>{submission.answers.length} questions answered</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {submission.answers.map((answer, index) => (
                                    <div key={answer.id} className="border-b pb-4 last:border-0 last:pb-0">
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <span className="mr-2 text-sm font-medium text-muted-foreground">
                                                    Q{index + 1}
                                                </span>
                                                <span className="font-medium">{answer.question_text}</span>
                                            </div>
                                            {answer.score_value > 0 && (
                                                <Badge variant="secondary">+{answer.score_value} pts</Badge>
                                            )}
                                        </div>
                                        <div className="ml-6">
                                            {answer.selected_options.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {answer.selected_options.map((option, i) => (
                                                        <Badge key={i} variant="outline">
                                                            {option}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : answer.answer_value ? (
                                                <p className="text-muted-foreground">{answer.answer_value}</p>
                                            ) : (
                                                <p className="text-muted-foreground italic">No answer provided</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
