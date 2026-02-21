import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, FileText, Plus, Users } from 'lucide-react';

interface Stats {
    total_quizzes: number;
    total_leads: number;
    total_completions: number;
}

interface Quiz {
    id: number;
    title: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    leads_count: number;
    submissions_count: number;
}

interface DashboardProps {
    stats: Stats;
    recentQuizzes: Quiz[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ stats, recentQuizzes }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                
                {/* Stats Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_quizzes}</div>
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
                            <CardTitle className="text-sm font-medium">Completions</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_completions}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Quizzes Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Quizzes</h2>
                        <Button asChild>
                            <Link href="/quizzes/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Quiz
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            {recentQuizzes.length > 0 ? (
                                <div className="w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Leads</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {recentQuizzes.map((quiz) => (
                                                <tr key={quiz.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <td className="p-4 align-middle font-medium">{quiz.title}</td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
                                                            {quiz.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle">{quiz.created_at}</td>
                                                    <td className="p-4 align-middle text-right">{quiz.leads_count}</td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/quizzes/${quiz.id}/edit`}>Edit</Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mt-4 text-lg font-semibold">No quizzes yet</h3>
                                    <p className="text-muted-foreground mb-4">Create your first quiz to start collecting leads.</p>
                                    <Button asChild>
                                        <Link href="/quizzes/create">Create Quiz</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
