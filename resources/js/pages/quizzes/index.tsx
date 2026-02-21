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
import { BarChart3, Copy, Edit, ExternalLink, FileText, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

interface Quiz {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    type: string;
    created_at: string;
    leads_count: number;
    submissions_count: number;
    questions_count: number;
}

interface PaginatedQuizzes {
    data: Quiz[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface QuizzesIndexProps {
    quizzes: PaginatedQuizzes;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Quizzes', href: '/quizzes' },
];

const statusColors = {
    draft: 'secondary',
    published: 'default',
    archived: 'outline',
} as const;

export default function QuizzesIndex({ quizzes }: QuizzesIndexProps) {
    const handleDelete = (quiz: Quiz) => {
        if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
            router.delete(`/quizzes/${quiz.id}`);
        }
    };

    const handleDuplicate = (quiz: Quiz) => {
        router.post(`/quizzes/${quiz.id}/duplicate`);
    };

    const handleStatusChange = (quiz: Quiz, status: string) => {
        router.patch(`/quizzes/${quiz.id}/status`, { status });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quizzes" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quizzes</h1>
                        <p className="text-muted-foreground">Manage your quiz funnels and scorecards</p>
                    </div>
                    <Button asChild>
                        <Link href="/quizzes/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Quiz
                        </Link>
                    </Button>
                </div>

                {/* Quiz List */}
                {quizzes.data.length > 0 ? (
                    <div className="grid gap-4">
                        {quizzes.data.map((quiz) => (
                            <Card key={quiz.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/quizzes/${quiz.id}/edit`}
                                                className="font-semibold hover:underline"
                                            >
                                                {quiz.title}
                                            </Link>
                                            <Badge variant={statusColors[quiz.status]}>{quiz.status}</Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {quiz.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{quiz.questions_count} questions</span>
                                            <span>{quiz.submissions_count} responses</span>
                                            <span>{quiz.leads_count} leads</span>
                                            <span>Created {quiz.created_at}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/quizzes/${quiz.id}/analytics`}>
                                                <BarChart3 className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/quizzes/${quiz.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        {quiz.status === 'published' && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={`/q/${quiz.slug}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {quiz.status === 'draft' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(quiz, 'published')}>
                                                        Publish
                                                    </DropdownMenuItem>
                                                )}
                                                {quiz.status === 'published' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(quiz, 'draft')}>
                                                        Unpublish
                                                    </DropdownMenuItem>
                                                )}
                                                {quiz.status !== 'archived' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(quiz, 'archived')}>
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDuplicate(quiz)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(quiz)}
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
                        {quizzes.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {quizzes.links.map((link, index) => (
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
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No quizzes yet</h3>
                            <p className="mb-4 text-muted-foreground">
                                Create your first quiz to start collecting leads.
                            </p>
                            <Button asChild>
                                <Link href="/quizzes/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Quiz
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
