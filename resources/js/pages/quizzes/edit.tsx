import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Copy, ExternalLink, GripVertical, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

interface AnswerOption {
    id?: number;
    label: string;
    value: string;
    score_value: number;
    order: number;
}

interface Question {
    id: number;
    type: 'single_choice' | 'multiple_choice' | 'scale' | 'open_text';
    question_text: string;
    help_text: string | null;
    order: number;
    required: boolean;
    scoring_dimension: string | null;
    answer_options: AnswerOption[];
}

interface ResultOutcome {
    id: number;
    name: string;
    description: string;
    score_min: number | null;
    score_max: number | null;
    content_blocks: object | null;
    cta_override: object | null;
    order: number;
}

interface BrandSettings {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
}

interface Quiz {
    id: number;
    title: string;
    slug: string;
    description: string;
    status: 'draft' | 'published' | 'archived';
    type: string;
    lead_capture_mode: string;
    brand_settings: BrandSettings | null;
    cta_settings: object | null;
    max_possible_score: number;
    questions: Question[];
    result_outcomes: ResultOutcome[];
}

interface QuizEditProps {
    quiz: Quiz;
}

const questionTypes = [
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'scale', label: 'Scale (1-10)' },
    { value: 'open_text', label: 'Open Text' },
];

const quizTypes = [
    { value: 'assessment', label: 'Assessment' },
    { value: 'scorecard', label: 'Scorecard' },
    { value: 'profile', label: 'Profile Quiz' },
    { value: 'survey', label: 'Survey' },
    { value: 'waitlist', label: 'Waitlist' },
];

interface SortableQuestionItemProps {
    question: Question;
    index: number;
    onEdit: (question: Question) => void;
    onDelete: (questionId: number) => void;
}

function SortableQuestionItem({ question, index, onEdit, onDelete }: SortableQuestionItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} className={isDragging ? 'z-50 shadow-lg' : ''}>
            <CardContent className="flex items-center gap-4 p-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
                    type="button"
                >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Q{index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                            {question.type.replace('_', ' ')}
                        </Badge>
                        {question.required && (
                            <Badge variant="secondary" className="text-xs">
                                Required
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 font-medium">{question.question_text}</p>
                    {question.answer_options.length > 0 && (
                        <p className="text-sm text-muted-foreground">{question.answer_options.length} options</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
                        Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(question.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function QuizEdit({ quiz }: QuizEditProps) {
    const [activeTab, setActiveTab] = useState<'basics' | 'questions' | 'outcomes' | 'design'>('basics');
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editingOutcome, setEditingOutcome] = useState<ResultOutcome | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [orderedQuestions, setOrderedQuestions] = useState<Question[]>(quiz.questions);

    // Sync orderedQuestions when quiz.questions changes (e.g., after add/delete)
    useEffect(() => {
        setOrderedQuestions(quiz.questions);
    }, [quiz.questions]);

    // DnD sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const questionIds = useMemo(() => orderedQuestions.map((q) => q.id), [orderedQuestions]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = orderedQuestions.findIndex((q) => q.id === active.id);
            const newIndex = orderedQuestions.findIndex((q) => q.id === over.id);

            const newOrder = arrayMove(orderedQuestions, oldIndex, newIndex);
            setOrderedQuestions(newOrder);

            // Send reorder request to backend
            router.post(
                `/quizzes/${quiz.id}/questions/reorder`,
                {
                    questions: newOrder.map((q, index) => ({
                        id: q.id,
                        order: index,
                    })),
                },
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const publicUrl = `${window.location.origin}/q/${quiz.slug}`;

    const copyLink = async () => {
        await navigator.clipboard.writeText(publicUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Quizzes', href: '/quizzes' },
        { title: quiz.title, href: `/quizzes/${quiz.id}/edit` },
    ];

    // Basic info form
    const basicsForm = useForm({
        title: quiz.title,
        description: quiz.description || '',
        type: quiz.type,
        lead_capture_mode: quiz.lead_capture_mode,
    });

    const handleBasicsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        basicsForm.put(`/quizzes/${quiz.id}`);
    };

    // Design form (brand_settings is stored on the quiz and styles the
    // public quiz pages; the update endpoint requires the basics fields,
    // so they ride along unchanged)
    const designForm = useForm({
        title: quiz.title,
        description: quiz.description || '',
        type: quiz.type,
        lead_capture_mode: quiz.lead_capture_mode,
        brand_settings: {
            primary_color: quiz.brand_settings?.primary_color || '#E97451',
            secondary_color: quiz.brand_settings?.secondary_color || '#E85D04',
            logo_url: quiz.brand_settings?.logo_url || '',
        },
    });

    const handleDesignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        designForm.put(`/quizzes/${quiz.id}`, { preserveScroll: true });
    };

    const setBrandSetting = (key: 'primary_color' | 'secondary_color' | 'logo_url', value: string) => {
        designForm.setData('brand_settings', { ...designForm.data.brand_settings, [key]: value });
    };

    // Question form
    const questionForm = useForm({
        type: 'single_choice' as string,
        question_text: '',
        help_text: '',
        required: true,
        scoring_dimension: '',
        answer_options: [
            { label: '', value: '', score_value: 0 },
            { label: '', value: '', score_value: 0 },
        ] as Array<{ id?: number; label: string; value: string; score_value: number }>,
    });

    const openQuestionDialog = (question?: Question) => {
        if (question) {
            setEditingQuestion(question);
            questionForm.setData({
                type: question.type,
                question_text: question.question_text,
                help_text: question.help_text || '',
                required: question.required,
                scoring_dimension: question.scoring_dimension || '',
                answer_options: question.answer_options.map((o) => ({
                    id: o.id,
                    label: o.label,
                    value: o.value,
                    score_value: o.score_value,
                })),
            });
        } else {
            setEditingQuestion(null);
            questionForm.reset();
        }
        setQuestionDialogOpen(true);
    };

    const handleQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Only include answer_options for choice-type questions
        const isChoiceType = ['single_choice', 'multiple_choice'].includes(questionForm.data.type);
        const dataToSubmit = {
            ...questionForm.data,
            answer_options: isChoiceType ? questionForm.data.answer_options : [],
        };

        if (editingQuestion) {
            router.put(`/quizzes/${quiz.id}/questions/${editingQuestion.id}`, dataToSubmit, {
                onSuccess: () => {
                    setQuestionDialogOpen(false);
                    questionForm.reset();
                },
            });
        } else {
            router.post(`/quizzes/${quiz.id}/questions`, dataToSubmit, {
                onSuccess: () => {
                    setQuestionDialogOpen(false);
                    questionForm.reset();
                },
            });
        }
    };

    const deleteQuestion = (questionId: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(`/quizzes/${quiz.id}/questions/${questionId}`);
        }
    };

    const addAnswerOption = () => {
        questionForm.setData('answer_options', [
            ...questionForm.data.answer_options,
            { label: '', value: '', score_value: 0 },
        ]);
    };

    const removeAnswerOption = (index: number) => {
        const newOptions = questionForm.data.answer_options.filter((_, i) => i !== index);
        questionForm.setData('answer_options', newOptions);
    };

    const updateAnswerOption = (index: number, field: string, value: string | number) => {
        const newOptions = [...questionForm.data.answer_options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        questionForm.setData('answer_options', newOptions);
    };

    // Outcome form
    const outcomeForm = useForm({
        name: '',
        description: '',
        score_min: '' as string | number,
        score_max: '' as string | number,
    });

    const openOutcomeDialog = (outcome?: ResultOutcome) => {
        if (outcome) {
            setEditingOutcome(outcome);
            outcomeForm.setData({
                name: outcome.name,
                description: outcome.description,
                score_min: outcome.score_min ?? '',
                score_max: outcome.score_max ?? '',
            });
        } else {
            setEditingOutcome(null);
            outcomeForm.reset();
        }
        setOutcomeDialogOpen(true);
    };

    const handleOutcomeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...outcomeForm.data,
            score_min: outcomeForm.data.score_min === '' ? null : Number(outcomeForm.data.score_min),
            score_max: outcomeForm.data.score_max === '' ? null : Number(outcomeForm.data.score_max),
        };

        if (editingOutcome) {
            router.put(`/quizzes/${quiz.id}/outcomes/${editingOutcome.id}`, data, {
                onSuccess: () => {
                    setOutcomeDialogOpen(false);
                    outcomeForm.reset();
                },
            });
        } else {
            router.post(`/quizzes/${quiz.id}/outcomes`, data, {
                onSuccess: () => {
                    setOutcomeDialogOpen(false);
                    outcomeForm.reset();
                },
            });
        }
    };

    const deleteOutcome = (outcomeId: number) => {
        if (confirm('Are you sure you want to delete this outcome?')) {
            router.delete(`/quizzes/${quiz.id}/outcomes/${outcomeId}`);
        }
    };

    const handleStatusChange = (status: string) => {
        router.patch(`/quizzes/${quiz.id}/status`, { status });
    };

    const tabs = [
        { id: 'basics', label: 'Basics' },
        { id: 'questions', label: `Questions (${orderedQuestions.length})` },
        { id: 'outcomes', label: `Score Thresholds (${quiz.result_outcomes.length})` },
        { id: 'design', label: 'Design' },
    ] as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${quiz.title}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{quiz.title}</h1>
                        <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>{quiz.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        {quiz.status === 'published' && (
                            <>
                                <Button variant="outline" size="sm" onClick={copyLink}>
                                    {linkCopied ? (
                                        <Check className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Copy className="mr-2 h-4 w-4" />
                                    )}
                                    {linkCopied ? 'Copied!' : 'Copy Link'}
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Preview
                                    </a>
                                </Button>
                            </>
                        )}
                        {quiz.status === 'draft' && (
                            <Button onClick={() => handleStatusChange('published')}>Publish</Button>
                        )}
                        {quiz.status === 'published' && (
                            <Button variant="outline" onClick={() => handleStatusChange('draft')}>
                                Unpublish
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 border-b">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1">
                    {/* Basics Tab */}
                    {activeTab === 'basics' && (
                        <form onSubmit={handleBasicsSubmit} className="max-w-2xl space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quiz Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={basicsForm.data.title}
                                            onChange={(e) => basicsForm.setData('title', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={basicsForm.data.description}
                                            onChange={(e) => basicsForm.setData('description', e.target.value)}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Quiz Type</Label>
                                            <Select
                                                value={basicsForm.data.type}
                                                onValueChange={(v) => basicsForm.setData('type', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {quizTypes.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lead Capture</Label>
                                            <Select
                                                value={basicsForm.data.lead_capture_mode}
                                                onValueChange={(v) => basicsForm.setData('lead_capture_mode', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="required">Required</SelectItem>
                                                    <SelectItem value="optional">Optional</SelectItem>
                                                    <SelectItem value="disabled">Disabled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Button type="submit" disabled={basicsForm.processing}>
                                {basicsForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </form>
                    )}

                    {/* Questions Tab */}
                    {activeTab === 'questions' && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button onClick={() => openQuestionDialog()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Question
                                </Button>
                            </div>

                            {orderedQuestions.length > 0 ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3">
                                            {orderedQuestions.map((question, index) => (
                                                <SortableQuestionItem
                                                    key={question.id}
                                                    question={question}
                                                    index={index}
                                                    onEdit={openQuestionDialog}
                                                    onDelete={deleteQuestion}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <p className="mb-4 text-muted-foreground">No questions yet. Add your first question!</p>
                                        <Button onClick={() => openQuestionDialog()}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Question
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Outcomes Tab */}
                    {activeTab === 'outcomes' && (
                        <div className="space-y-6">
                            {/* Scoring Info */}
                            <Card className="border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">How Scoring Works</h4>
                                    <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Scale questions (1-10):</strong> The selected number is the score.
                                        <br />
                                        <strong>Choice questions:</strong> Each answer option has a score value you set.
                                        <br />
                                        <strong>Open text:</strong> No score contribution.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Score Thresholds Overview */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Score Thresholds</CardTitle>
                                            <CardDescription>
                                                Define score ranges and what each level means for quiz takers
                                            </CardDescription>
                                        </div>
                                        <Button onClick={() => openOutcomeDialog()}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Threshold
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {quiz.result_outcomes.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Visual Score Range Bar */}
                                            <div className="rounded-lg border bg-muted/30 p-4">
                                                <div className="mb-2 text-sm font-medium">Score Range Overview</div>
                                                <div className="flex h-8 overflow-hidden rounded-md">
                                                    {quiz.result_outcomes
                                                        .sort((a, b) => (a.score_min ?? 0) - (b.score_min ?? 0))
                                                        .map((outcome, index) => {
                                                            const colors = [
                                                                'bg-red-400',
                                                                'bg-orange-400',
                                                                'bg-yellow-400',
                                                                'bg-lime-400',
                                                                'bg-green-400',
                                                                'bg-emerald-400',
                                                                'bg-teal-400',
                                                            ];
                                                            return (
                                                                <div
                                                                    key={outcome.id}
                                                                    className={`flex flex-1 items-center justify-center text-xs font-medium text-white ${colors[index % colors.length]}`}
                                                                    title={`${outcome.name}: ${outcome.score_min ?? 0} - ${outcome.score_max ?? '∞'}`}
                                                                >
                                                                    {outcome.score_min ?? 0}-{outcome.score_max ?? '∞'}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                                    <span>Lower scores</span>
                                                    <span>Higher scores</span>
                                                </div>
                                                <p className="mt-3 text-xs text-muted-foreground">
                                                    Maximum possible score on this quiz:{' '}
                                                    <span className="font-semibold text-foreground">{quiz.max_possible_score} points</span>
                                                    {' '}— a threshold range above that can never match a real result.
                                                </p>
                                            </div>

                                            {/* Threshold Cards */}
                                            <div className="space-y-3">
                                                {quiz.result_outcomes
                                                    .sort((a, b) => (a.score_min ?? 0) - (b.score_min ?? 0))
                                                    .map((outcome, index) => {
                                                        const colors = [
                                                            'border-l-red-400',
                                                            'border-l-orange-400',
                                                            'border-l-yellow-400',
                                                            'border-l-lime-400',
                                                            'border-l-green-400',
                                                            'border-l-emerald-400',
                                                            'border-l-teal-400',
                                                        ];
                                                        return (
                                                            <div
                                                                key={outcome.id}
                                                                className={`rounded-lg border border-l-4 ${colors[index % colors.length]} bg-card dark:bg-white/5 backdrop-blur-sm p-4`}
                                                            >
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <h3 className="font-semibold">{outcome.name}</h3>
                                                                            <Badge variant="outline">
                                                                                {outcome.score_min ?? 0} - {outcome.score_max ?? '∞'} pts
                                                                            </Badge>
                                                                        </div>
                                                                        {outcome.description && (
                                                                            <p className="mt-2 text-sm text-muted-foreground">
                                                                                {outcome.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => openOutcomeDialog(outcome)}
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-destructive hover:text-destructive"
                                                                            onClick={() => deleteOutcome(outcome.id)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="mb-4 rounded-full bg-muted p-3">
                                                <Plus className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <h3 className="font-semibold">No score thresholds yet</h3>
                                            <p className="mb-4 max-w-md text-sm text-muted-foreground">
                                                Define what different score ranges mean. For example:
                                                <br />
                                                0-30 = "Beginner", 31-70 = "Intermediate", 71-100 = "Expert"
                                            </p>
                                            <Button onClick={() => openOutcomeDialog()}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Your First Threshold
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Design Tab */}
                    {activeTab === 'design' && (
                        <form onSubmit={handleDesignSubmit} className="max-w-2xl space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Design Settings</CardTitle>
                                    <CardDescription>
                                        These colors style your public quiz and results pages — buttons, progress, and accents use your
                                        primary color.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="primary_color">Primary color</Label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={designForm.data.brand_settings.primary_color}
                                                    onChange={(e) => setBrandSetting('primary_color', e.target.value)}
                                                    className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
                                                />
                                                <Input
                                                    id="primary_color"
                                                    value={designForm.data.brand_settings.primary_color}
                                                    onChange={(e) => setBrandSetting('primary_color', e.target.value)}
                                                    placeholder="#E97451"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="secondary_color">Secondary color</Label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={designForm.data.brand_settings.secondary_color}
                                                    onChange={(e) => setBrandSetting('secondary_color', e.target.value)}
                                                    className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
                                                />
                                                <Input
                                                    id="secondary_color"
                                                    value={designForm.data.brand_settings.secondary_color}
                                                    onChange={(e) => setBrandSetting('secondary_color', e.target.value)}
                                                    placeholder="#E85D04"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logo_url">Logo URL (optional)</Label>
                                        <Input
                                            id="logo_url"
                                            value={designForm.data.brand_settings.logo_url}
                                            onChange={(e) => setBrandSetting('logo_url', e.target.value)}
                                            placeholder="https://example.com/logo.png"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Stored with your brand settings for use on your quiz pages.
                                        </p>
                                    </div>

                                    {/* Live preview */}
                                    <div className="space-y-2">
                                        <Label>Preview</Label>
                                        <div className="rounded-lg border bg-card p-4">
                                            <div
                                                className="mb-3 h-2 rounded-full"
                                                style={{
                                                    background: `linear-gradient(to right, ${designForm.data.brand_settings.primary_color}, ${designForm.data.brand_settings.secondary_color})`,
                                                }}
                                            />
                                            <p className="mb-3 text-sm font-medium">{quiz.title}</p>
                                            <span
                                                className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white"
                                                style={{ backgroundColor: designForm.data.brand_settings.primary_color }}
                                            >
                                                Continue
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Button type="submit" disabled={designForm.processing}>
                                {designForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Design
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            {/* Question Dialog */}
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
                        <DialogDescription>Configure the question details and answer options</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQuestionSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Question Type</Label>
                                <Select
                                    value={questionForm.data.type}
                                    onValueChange={(v) => questionForm.setData('type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionTypes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Scoring Dimension (optional)</Label>
                                <Input
                                    value={questionForm.data.scoring_dimension}
                                    onChange={(e) => questionForm.setData('scoring_dimension', e.target.value)}
                                    placeholder="e.g., Strategy, Leadership"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Question Text</Label>
                            <textarea
                                value={questionForm.data.question_text}
                                onChange={(e) => questionForm.setData('question_text', e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Help Text (optional)</Label>
                            <Input
                                value={questionForm.data.help_text}
                                onChange={(e) => questionForm.setData('help_text', e.target.value)}
                                placeholder="Additional context for the question"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="required"
                                checked={questionForm.data.required}
                                onChange={(e) => questionForm.setData('required', e.target.checked)}
                            />
                            <Label htmlFor="required">Required question</Label>
                        </div>

                        {['single_choice', 'multiple_choice'].includes(questionForm.data.type) && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Answer Options</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addAnswerOption}>
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add Option
                                        </Button>
                                    </div>
                                    {questionForm.data.answer_options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                placeholder="Option label"
                                                value={option.label}
                                                onChange={(e) => updateAnswerOption(index, 'label', e.target.value)}
                                                className="flex-1"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Score"
                                                value={option.score_value}
                                                onChange={(e) =>
                                                    updateAnswerOption(index, 'score_value', parseInt(e.target.value) || 0)
                                                }
                                                className="w-20"
                                            />
                                            {questionForm.data.answer_options.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeAnswerOption(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setQuestionDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={questionForm.processing}>
                                {questionForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingQuestion ? 'Update' : 'Add'} Question
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Outcome Dialog */}
            <Dialog open={outcomeDialogOpen} onOpenChange={setOutcomeDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingOutcome ? 'Edit Score Threshold' : 'Add Score Threshold'}</DialogTitle>
                        <DialogDescription>
                            Define a score range and what it means for quiz takers
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleOutcomeSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Threshold Name</Label>
                            <Input
                                value={outcomeForm.data.name}
                                onChange={(e) => outcomeForm.setData('name', e.target.value)}
                                placeholder="e.g., Beginner, Intermediate, Expert"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                This is the label users will see for their result
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>What This Score Means</Label>
                            <textarea
                                value={outcomeForm.data.description}
                                onChange={(e) => outcomeForm.setData('description', e.target.value)}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Explain what achieving this score level means for the user. What does it tell them about their results?"
                                required
                            />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <Label>Score Range</Label>
                            <p className="text-xs text-muted-foreground">
                                Users scoring within this range will see this result
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">From (min score)</Label>
                                    <Input
                                        type="number"
                                        value={outcomeForm.data.score_min}
                                        onChange={(e) => outcomeForm.setData('score_min', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">To (max score)</Label>
                                    <Input
                                        type="number"
                                        value={outcomeForm.data.score_max}
                                        onChange={(e) => outcomeForm.setData('score_max', e.target.value)}
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This quiz's maximum possible score is {quiz.max_possible_score} points.
                            </p>
                            {((outcomeForm.data.score_min !== '' && Number(outcomeForm.data.score_min) > quiz.max_possible_score) ||
                                (outcomeForm.data.score_max !== '' && Number(outcomeForm.data.score_max) > quiz.max_possible_score)) && (
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                    Heads up: this range goes above the maximum possible score, so part of it can never match a real
                                    result. You can still save it — just double-check the numbers.
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOutcomeDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={outcomeForm.processing}>
                                {outcomeForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingOutcome ? 'Update' : 'Add'} Threshold
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
