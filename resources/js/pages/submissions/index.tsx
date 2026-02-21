import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Download, Eye } from 'lucide-react';

interface Submission {
    id: number;
    quiz_title: string;
    quiz_id: number;
    lead_email: string;
    lead_name: string;
    total_score: number;
    outcome: string;
    submitted_at: string;
}

interface PaginatedSubmissions {
    data: Submission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Quiz {
    id: number;
    title: string;
}

interface SubmissionsIndexProps {
    submissions: PaginatedSubmissions;
    quizzes: Quiz[];
    selectedQuizId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Responses', href: '/submissions' },
];

export default function SubmissionsIndex({ submissions, quizzes, selectedQuizId }: SubmissionsIndexProps) {
    const handleQuizFilter = (quizId: string) => {
        if (quizId === 'all') {
            router.get('/submissions');
        } else {
            router.get('/submissions', { quiz_id: quizId });
        }
    };

    const handleExport = () => {
        const url = selectedQuizId ? `/submissions/export?quiz_id=${selectedQuizId}` : '/submissions/export';
        window.location.href = url;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Responses" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Responses</h1>
                        <p className="text-muted-foreground">Quiz submissions and answers</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={selectedQuizId?.toString() ?? 'all'}
                            onValueChange={handleQuizFilter}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by quiz" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Quizzes</SelectItem>
                                {quizzes.map((quiz) => (
                                    <SelectItem key={quiz.id} value={quiz.id.toString()}>
                                        {quiz.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Submissions Table */}
                {submissions.data.length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-3 text-left font-medium">Contact</th>
                                            <th className="px-4 py-3 text-left font-medium">Quiz</th>
                                            <th className="px-4 py-3 text-left font-medium">Score</th>
                                            <th className="px-4 py-3 text-left font-medium">Result</th>
                                            <th className="px-4 py-3 text-left font-medium">Submitted</th>
                                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.data.map((submission) => (
                                            <tr
                                                key={submission.id}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{submission.lead_name}</div>
                                                    <div className="text-muted-foreground">{submission.lead_email}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/quizzes/${submission.quiz_id}/edit`}
                                                        className="hover:underline"
                                                    >
                                                        {submission.quiz_title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{submission.total_score}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{submission.outcome}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {submission.submitted_at}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/submissions/${submission.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No responses yet</h3>
                            <p className="text-muted-foreground">
                                Responses will appear here when people complete your quizzes.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {submissions.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {submissions.links.map((link, index) => (
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
        </AppLayout>
    );
}
