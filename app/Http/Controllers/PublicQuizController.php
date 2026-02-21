<?php

namespace App\Http\Controllers;

use App\Models\AnswerOption;
use App\Models\Lead;
use App\Models\Quiz;
use App\Models\QuizView;
use App\Models\Submission;
use App\Models\SubmissionAnswer;
use App\Services\CampaignSubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PublicQuizController extends Controller
{
    /**
     * Display the quiz for taking.
     */
    public function show(string $slug)
    {
        $quiz = Quiz::where('slug', $slug)
            ->published()
            ->with(['questions.answerOptions'])
            ->firstOrFail();

        // Track view
        QuizView::create([
            'quiz_id' => $quiz->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'referrer' => request()->header('referer'),
            'viewed_at' => now(),
        ]);

        $alreadyCompleted = request()->cookie('quiz_completed_' . $quiz->id);

        return Inertia::render('public/quiz', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'slug' => $quiz->slug,
                'description' => $quiz->description,
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
                    'answer_options' => $q->answerOptions->map(fn ($a) => [
                        'id' => $a->id,
                        'label' => $a->label,
                        'value' => $a->value,
                        'order' => $a->order,
                    ]),
                ]),
            ],
            'already_completed' => (bool) $alreadyCompleted,
        ]);
    }

    /**
     * Submit quiz answers.
     */
    public function submit(Request $request, string $slug)
    {
        $quiz = Quiz::where('slug', $slug)
            ->published()
            ->with(['questions.answerOptions', 'resultOutcomes'])
            ->firstOrFail();

        // Honeypot check
        if ($request->filled('website')) {
            abort(422, 'Spam detected.');
        }

        // Check if already completed
        if ($request->cookie('quiz_completed_' . $quiz->id)) {
            return redirect()->back()->withErrors(['message' => 'You have already completed this quiz.']);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer|exists:questions,id',
            'answers.*.answer_option_ids' => 'nullable|array',
            'answers.*.answer_option_ids.*' => 'integer|exists:answer_options,id',
            'answers.*.answer_value' => 'nullable|string',
            'lead.email' => $quiz->lead_capture_mode === 'required' ? 'required|email' : 'nullable|email',
            'lead.first_name' => 'nullable|string|max:255',
            'lead.last_name' => 'nullable|string|max:255',
            'lead.phone' => 'nullable|string|max:50',
        ]);

        $visitorId = $request->cookie('visitor_id') ?? (string) Str::uuid();

        return DB::transaction(function () use ($quiz, $validated, $request, $visitorId) {
            // Create lead if provided
            $lead = null;
            if (!empty($validated['lead']['email'])) {
                $lead = Lead::updateOrCreate(
                    [
                        'quiz_id' => $quiz->id,
                        'email' => $validated['lead']['email'],
                    ],
                    [
                        'visitor_id' => $visitorId,
                        'first_name' => $validated['lead']['first_name'] ?? null,
                        'last_name' => $validated['lead']['last_name'] ?? null,
                        'phone' => $validated['lead']['phone'] ?? null,
                    ]
                );

                // Auto-subscribe to campaigns triggered by this quiz
                $subscriptionService = new CampaignSubscriptionService();
                $subscriptionService->subscribeFromQuiz($quiz, $lead);
            }

            // Calculate scores
            $totalScore = 0;
            $dimensionScores = [];

            foreach ($validated['answers'] as $answerData) {
                $question = $quiz->questions->find($answerData['question_id']);
                if (!$question) continue;

                $answerScore = 0;
                
                // Score based on question type
                if ($question->type === 'scale') {
                    // For scale questions, use the answer_value directly as the score
                    $answerScore = (int) ($answerData['answer_value'] ?? 0);
                } elseif (!empty($answerData['answer_option_ids'])) {
                    // For choice questions, sum the score_value of selected options
                    $selectedOptions = AnswerOption::whereIn('id', $answerData['answer_option_ids'])->get();
                    $answerScore = $selectedOptions->sum('score_value');
                }
                // open_text questions don't contribute to score

                $totalScore += $answerScore;

                // Track dimension scores
                if ($question->scoring_dimension) {
                    $dimensionScores[$question->scoring_dimension] = 
                        ($dimensionScores[$question->scoring_dimension] ?? 0) + $answerScore;
                }
            }

            // Determine result outcome
            $resultOutcome = $quiz->resultOutcomes
                ->filter(function ($outcome) use ($totalScore) {
                    $meetsMin = $outcome->score_min === null || $totalScore >= $outcome->score_min;
                    $meetsMax = $outcome->score_max === null || $totalScore <= $outcome->score_max;
                    return $meetsMin && $meetsMax;
                })
                ->first();

            // Create submission
            $submission = Submission::create([
                'quiz_id' => $quiz->id,
                'lead_id' => $lead?->id,
                'result_outcome_id' => $resultOutcome?->id,
                'total_score' => $totalScore,
                'dimension_scores' => $dimensionScores,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'started_at' => now(),
                'submitted_at' => now(),
            ]);

            // Create submission answers
            foreach ($validated['answers'] as $answerData) {
                $question = $quiz->questions->find($answerData['question_id']);
                if (!$question) continue;

                $answerScore = 0;
                if ($question->type === 'scale') {
                    $answerScore = (int) ($answerData['answer_value'] ?? 0);
                } elseif (!empty($answerData['answer_option_ids'])) {
                    $selectedOptions = AnswerOption::whereIn('id', $answerData['answer_option_ids'])->get();
                    $answerScore = $selectedOptions->sum('score_value');
                }

                SubmissionAnswer::create([
                    'submission_id' => $submission->id,
                    'question_id' => $answerData['question_id'],
                    'answer_value' => $answerData['answer_value'] ?? null,
                    'answer_option_ids' => $answerData['answer_option_ids'] ?? [],
                    'score_value' => $answerScore,
                ]);
            }

            return redirect()->route('public.quiz.results', [
                'slug' => $quiz->slug,
                'submission' => $submission->id,
            ])
            ->withCookie(cookie('quiz_completed_' . $quiz->id, true, 525600)) // 1 year
            ->withCookie(cookie('visitor_id', $visitorId, 2628000)); // 5 years
        });
    }

    /**
     * Display quiz results.
     */
    public function results(string $slug, Submission $submission)
    {
        $quiz = Quiz::where('slug', $slug)->firstOrFail();

        // Verify submission belongs to this quiz
        if ($submission->quiz_id !== $quiz->id) {
            abort(404);
        }

        $submission->load(['resultOutcome', 'answers.question']);

        return Inertia::render('public/results', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'brand_settings' => $quiz->brand_settings,
                'cta_settings' => $quiz->cta_settings,
            ],
            'submission' => [
                'id' => $submission->id,
                'total_score' => $submission->total_score,
                'dimension_scores' => $submission->dimension_scores,
            ],
            'outcome' => $submission->resultOutcome ? [
                'name' => $submission->resultOutcome->name,
                'description' => $submission->resultOutcome->description,
                'content_blocks' => $submission->resultOutcome->content_blocks,
                'cta_override' => $submission->resultOutcome->cta_override,
            ] : null,
        ]);
    }
}
