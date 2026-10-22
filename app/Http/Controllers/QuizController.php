<?php

namespace App\Http\Controllers;

use App\Models\AnswerOption;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\ResultOutcome;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        
        $quizzes = Quiz::where('owner_id', $userId)
            ->withCount(['leads', 'submissions', 'questions'])
            ->latest()
            ->paginate(10)
            ->through(fn ($quiz) => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'slug' => $quiz->slug,
                'status' => $quiz->status,
                'type' => $quiz->type,
                'created_at' => $quiz->created_at->format('M d, Y'),
                'leads_count' => $quiz->leads_count,
                'submissions_count' => $quiz->submissions_count,
                'questions_count' => $quiz->questions_count,
            ]);

        return Inertia::render('quizzes/index', [
            'quizzes' => $quizzes,
        ]);
    }

    public function create()
    {
        return Inertia::render('quizzes/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:assessment,scorecard,profile,waitlist,survey',
            'lead_capture_mode' => 'required|in:required,optional,disabled',
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        
        while (Quiz::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $quiz = Quiz::create([
            'owner_id' => Auth::id(),
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? '',
            'status' => 'draft',
            'type' => $validated['type'],
            'lead_capture_mode' => $validated['lead_capture_mode'],
            'brand_settings' => [
                'primary_color' => '#E97451',
                'secondary_color' => '#8b5cf6',
            ],
            'cta_settings' => [
                'label' => 'Get Started',
                'url' => '',
            ],
        ]);

        return redirect()->route('quizzes.edit', $quiz->id)
            ->with('success', 'Quiz created successfully!');
    }

    public function edit(Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $quiz->load(['questions.answerOptions', 'resultOutcomes']);

        return Inertia::render('quizzes/edit', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'slug' => $quiz->slug,
                'description' => $quiz->description,
                'status' => $quiz->status,
                'type' => $quiz->type,
                'lead_capture_mode' => $quiz->lead_capture_mode,
                'brand_settings' => $quiz->brand_settings,
                'cta_settings' => $quiz->cta_settings,
                'questions' => $quiz->questions->map(fn ($q) => [
                    'id' => $q->id,
                    'type' => $q->type,
                    'question_text' => $q->question_text,
                    'help_text' => $q->help_text,
                    'order' => $q->order,
                    'required' => $q->required,
                    'scoring_dimension' => $q->scoring_dimension,
                    'answer_options' => $q->answerOptions->map(fn ($a) => [
                        'id' => $a->id,
                        'label' => $a->label,
                        'value' => $a->value,
                        'score_value' => $a->score_value,
                        'order' => $a->order,
                    ]),
                ]),
                'result_outcomes' => $quiz->resultOutcomes->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'description' => $r->description,
                    'score_min' => $r->score_min,
                    'score_max' => $r->score_max,
                    'content_blocks' => $r->content_blocks,
                    'cta_override' => $r->cta_override,
                    'order' => $r->order,
                ]),
            ],
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:assessment,scorecard,profile,waitlist,survey',
            'lead_capture_mode' => 'required|in:required,optional,disabled',
            'brand_settings' => 'nullable|array',
            'cta_settings' => 'nullable|array',
        ]);

        $quiz->update($validated);

        return back()->with('success', 'Quiz updated successfully!');
    }

    public function updateStatus(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'status' => 'required|in:draft,published,archived',
        ]);

        $quiz->update(['status' => $validated['status']]);

        return back()->with('success', 'Quiz status updated!');
    }

    public function destroy(Quiz $quiz)
    {
        $this->authorize('delete', $quiz);

        $quiz->delete();

        return redirect()->route('quizzes.index')
            ->with('success', 'Quiz deleted successfully!');
    }

    public function duplicate(Quiz $quiz)
    {
        $this->authorize('view', $quiz);

        DB::transaction(function () use ($quiz) {
            $newQuiz = $quiz->replicate();
            $newQuiz->title = $quiz->title . ' (Copy)';
            $newQuiz->slug = Str::slug($newQuiz->title) . '-' . Str::random(5);
            $newQuiz->status = 'draft';
            $newQuiz->save();

            foreach ($quiz->questions as $question) {
                $newQuestion = $question->replicate();
                $newQuestion->quiz_id = $newQuiz->id;
                $newQuestion->save();

                foreach ($question->answerOptions as $option) {
                    $newOption = $option->replicate();
                    $newOption->question_id = $newQuestion->id;
                    $newOption->save();
                }
            }

            foreach ($quiz->resultOutcomes as $outcome) {
                $newOutcome = $outcome->replicate();
                $newOutcome->quiz_id = $newQuiz->id;
                $newOutcome->save();
            }
        });

        return redirect()->route('quizzes.index')
            ->with('success', 'Quiz duplicated successfully!');
    }

    // Question management
    public function storeQuestion(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'type' => 'required|in:single_choice,multiple_choice,scale,open_text',
            'question_text' => 'required|string|max:500',
            'help_text' => 'nullable|string|max:255',
            'required' => 'boolean',
            'scoring_dimension' => 'nullable|string|max:100',
            'answer_options' => 'nullable|array',
            'answer_options.*.label' => 'required_with:answer_options|string|max:255',
            'answer_options.*.value' => 'nullable|string|max:100',
            'answer_options.*.score_value' => 'nullable|integer',
        ]);

        $maxOrder = $quiz->questions()->max('order') ?? 0;

        $question = $quiz->questions()->create([
            'type' => $validated['type'],
            'question_text' => $validated['question_text'],
            'help_text' => $validated['help_text'] ?? null,
            'required' => $validated['required'] ?? true,
            'scoring_dimension' => $validated['scoring_dimension'] ?? null,
            'order' => $maxOrder + 1,
        ]);

        if (!empty($validated['answer_options'])) {
            foreach ($validated['answer_options'] as $index => $option) {
                $question->answerOptions()->create([
                    'label' => $option['label'],
                    'value' => $option['value'] ?? Str::slug($option['label']),
                    'score_value' => $option['score_value'] ?? 0,
                    'order' => $index + 1,
                ]);
            }
        }

        return back()->with('success', 'Question added!');
    }

    public function updateQuestion(Request $request, Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'type' => 'required|in:single_choice,multiple_choice,scale,open_text',
            'question_text' => 'required|string|max:500',
            'help_text' => 'nullable|string|max:255',
            'required' => 'boolean',
            'scoring_dimension' => 'nullable|string|max:100',
            'answer_options' => 'nullable|array',
            'answer_options.*.id' => 'nullable|integer',
            'answer_options.*.label' => 'required_with:answer_options|string|max:255',
            'answer_options.*.value' => 'nullable|string|max:100',
            'answer_options.*.score_value' => 'nullable|integer',
        ]);

        $question->update([
            'type' => $validated['type'],
            'question_text' => $validated['question_text'],
            'help_text' => $validated['help_text'] ?? null,
            'required' => $validated['required'] ?? true,
            'scoring_dimension' => $validated['scoring_dimension'] ?? null,
        ]);

        // Update answer options
        $existingIds = [];
        if (!empty($validated['answer_options'])) {
            foreach ($validated['answer_options'] as $index => $optionData) {
                if (!empty($optionData['id'])) {
                    $option = AnswerOption::find($optionData['id']);
                    if ($option) {
                        $option->update([
                            'label' => $optionData['label'],
                            'value' => $optionData['value'] ?? Str::slug($optionData['label']),
                            'score_value' => $optionData['score_value'] ?? 0,
                            'order' => $index + 1,
                        ]);
                        $existingIds[] = $option->id;
                    }
                } else {
                    $newOption = $question->answerOptions()->create([
                        'label' => $optionData['label'],
                        'value' => $optionData['value'] ?? Str::slug($optionData['label']),
                        'score_value' => $optionData['score_value'] ?? 0,
                        'order' => $index + 1,
                    ]);
                    $existingIds[] = $newOption->id;
                }
            }
        }

        // Delete removed options
        $question->answerOptions()->whereNotIn('id', $existingIds)->delete();

        return back()->with('success', 'Question updated!');
    }

    public function destroyQuestion(Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz);

        $question->answerOptions()->delete();
        $question->delete();

        return back()->with('success', 'Question deleted!');
    }

    public function reorderQuestions(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|integer',
            'questions.*.order' => 'required|integer',
        ]);

        foreach ($validated['questions'] as $item) {
            Question::where('id', $item['id'])
                ->where('quiz_id', $quiz->id)
                ->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Questions reordered!');
    }

    // Result outcome management
    public function storeOutcome(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'score_min' => 'nullable|integer',
            'score_max' => 'nullable|integer',
            'content_blocks' => 'nullable|array',
            'cta_override' => 'nullable|array',
        ]);

        $maxOrder = $quiz->resultOutcomes()->max('order') ?? 0;

        $quiz->resultOutcomes()->create([
            ...$validated,
            'order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Result outcome added!');
    }

    public function updateOutcome(Request $request, Quiz $quiz, ResultOutcome $outcome)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'score_min' => 'nullable|integer',
            'score_max' => 'nullable|integer',
            'content_blocks' => 'nullable|array',
            'cta_override' => 'nullable|array',
        ]);

        $outcome->update($validated);

        return back()->with('success', 'Result outcome updated!');
    }

    public function destroyOutcome(Quiz $quiz, ResultOutcome $outcome)
    {
        $this->authorize('update', $quiz);

        $outcome->delete();

        return back()->with('success', 'Result outcome deleted!');
    }

    // Analytics
    public function analytics(Quiz $quiz)
    {
        $this->authorize('view', $quiz);

        $stats = [
            'total_views' => $quiz->views()->count(),
            'total_starts' => $quiz->submissions()->count(),
            'total_completions' => $quiz->submissions()->completed()->count(),
            'total_leads' => $quiz->leads()->count(),
            'completion_rate' => $quiz->submissions()->count() > 0 
                ? round(($quiz->submissions()->completed()->count() / $quiz->submissions()->count()) * 100, 1)
                : 0,
            'average_score' => $quiz->submissions()->completed()->avg('total_score') ?? 0,
        ];

        $recentSubmissions = $quiz->submissions()
            ->with(['lead', 'resultOutcome'])
            ->completed()
            ->latest('submitted_at')
            ->take(10)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'lead_email' => $s->lead?->email ?? 'Anonymous',
                'lead_name' => $s->lead?->full_name ?? 'Anonymous',
                'total_score' => $s->total_score,
                'outcome' => $s->resultOutcome?->name ?? 'N/A',
                'submitted_at' => $s->submitted_at->format('M d, Y H:i'),
            ]);

        return Inertia::render('quizzes/analytics', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'status' => $quiz->status,
            ],
            'stats' => $stats,
            'recentSubmissions' => $recentSubmissions,
        ]);
    }
}
