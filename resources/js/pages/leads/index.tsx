import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, Trash2, Users } from 'lucide-react';

interface Lead {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string;
    phone: string | null;
    quiz_title: string;
    quiz_id: number;
    latest_score: number | null;
    created_at: string;
}

interface PaginatedLeads {
    data: Lead[];
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

interface LeadsIndexProps {
    leads: PaginatedLeads;
    quizzes: Quiz[];
    selectedQuizId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leads', href: '/leads' },
];

export default function LeadsIndex({ leads, quizzes, selectedQuizId }: LeadsIndexProps) {
    const handleQuizFilter = (quizId: string) => {
        if (quizId === 'all') {
            router.get('/leads');
        } else {
            router.get('/leads', { quiz_id: quizId });
        }
    };

    const handleExport = () => {
        const url = selectedQuizId ? `/leads/export?quiz_id=${selectedQuizId}` : '/leads/export';
        window.location.href = url;
    };

    const handleDelete = (lead: Lead) => {
        if (confirm(`Are you sure you want to delete ${lead.email}?`)) {
            router.delete(`/leads/${lead.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leads" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Leads</h1>
                        <p className="text-muted-foreground">Contacts captured from your quizzes</p>
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

                {/* Leads Table */}
                {leads.data.length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-3 text-left font-medium">Contact</th>
                                            <th className="px-4 py-3 text-left font-medium">Quiz</th>
                                            <th className="px-4 py-3 text-left font-medium">Phone</th>
                                            <th className="px-4 py-3 text-left font-medium">Score</th>
                                            <th className="px-4 py-3 text-left font-medium">Captured</th>
                                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.data.map((lead) => (
                                            <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{lead.full_name}</div>
                                                    <div className="text-muted-foreground">{lead.email}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/quizzes/${lead.quiz_id}/edit`}
                                                        className="hover:underline"
                                                    >
                                                        {lead.quiz_title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {lead.phone || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {lead.latest_score !== null ? lead.latest_score : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{lead.created_at}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/leads/${lead.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(lead)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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
                            <Users className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No leads yet</h3>
                            <p className="text-muted-foreground">
                                Leads will appear here when people complete your quizzes.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {leads.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {leads.links.map((link, index) => (
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
