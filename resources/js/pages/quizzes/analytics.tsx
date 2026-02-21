import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, CheckCircle, Eye, Target, TrendingUp, Users } from 'lucide-react';

interface Stats {
    total_views: number;
    total_starts: number;
    total_completions: number;
    total_leads: number;
    completion_rate: number;
    average_score: number;
}

interface Submission {
    id: number;
    lead_email: string;
    lead_name: string;
    total_score: number;
    outcome: string;
    submitted_at: string;
}

interface QuizAnalyticsProps {
    quiz: {
        id: number;
        title: string;
        status: string;
    };
    stats: Stats;
    recentSubmissions: Submission[];
}

export default function QuizAnalytics({ quiz, stats, recentSubmissions }: QuizAnalyticsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Quizzes', href: '/quizzes' },
        { title: quiz.title, href: `/quizzes/${quiz.id}/edit` },
        { title: 'Analytics', href: `/quizzes/${quiz.id}/analytics` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Analytics: ${quiz.title}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{quiz.title}</h1>
                        <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>{quiz.status}</Badge>
                    </div>
                    <Link href={`/quizzes/${quiz.id}/edit`} className="text-sm text-muted-foreground hover:underline">
                        Edit Quiz
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_views}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quiz Starts</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_starts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completions</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_completions}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Leads Captured</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_leads}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completion_rate}%</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(stats.average_score)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Submissions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>The latest quiz completions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSubmissions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left font-medium">Contact</th>
                                            <th className="px-4 py-3 text-left font-medium">Score</th>
                                            <th className="px-4 py-3 text-left font-medium">Result</th>
                                            <th className="px-4 py-3 text-left font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSubmissions.map((submission) => (
                                            <tr key={submission.id} className="border-b last:border-0">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{submission.lead_name}</div>
                                                    <div className="text-muted-foreground">{submission.lead_email}</div>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{submission.total_score}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{submission.outcome}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {submission.submitted_at}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-muted-foreground">No submissions yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
