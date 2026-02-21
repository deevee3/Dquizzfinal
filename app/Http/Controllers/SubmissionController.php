<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubmissionController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $quizId = $request->get('quiz_id');

        $query = Submission::whereHas('quiz', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        })
        ->with(['quiz:id,title', 'lead:id,email,first_name,last_name', 'resultOutcome:id,name'])
        ->completed();

        if ($quizId) {
            $query->where('quiz_id', $quizId);
        }

        $submissions = $query->latest('submitted_at')
            ->paginate(20)
            ->through(fn ($submission) => [
                'id' => $submission->id,
                'quiz_title' => $submission->quiz->title,
                'quiz_id' => $submission->quiz_id,
                'lead_email' => $submission->lead?->email ?? 'Anonymous',
                'lead_name' => $submission->lead?->full_name ?? 'Anonymous',
                'total_score' => $submission->total_score,
                'outcome' => $submission->resultOutcome?->name ?? 'N/A',
                'submitted_at' => $submission->submitted_at->format('M d, Y H:i'),
            ]);

        $quizzes = Quiz::where('owner_id', $userId)
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('submissions/index', [
            'submissions' => $submissions,
            'quizzes' => $quizzes,
            'selectedQuizId' => $quizId ? (int) $quizId : null,
        ]);
    }

    public function show(Submission $submission)
    {
        $this->authorizeSubmissionAccess($submission);

        $submission->load([
            'quiz:id,title',
            'lead',
            'resultOutcome',
            'answers.question.answerOptions',
        ]);

        return Inertia::render('submissions/show', [
            'submission' => [
                'id' => $submission->id,
                'quiz' => $submission->quiz,
                'lead' => $submission->lead ? [
                    'id' => $submission->lead->id,
                    'email' => $submission->lead->email,
                    'full_name' => $submission->lead->full_name,
                    'phone' => $submission->lead->phone,
                ] : null,
                'total_score' => $submission->total_score,
                'dimension_scores' => $submission->dimension_scores,
                'outcome' => $submission->resultOutcome ? [
                    'name' => $submission->resultOutcome->name,
                    'description' => $submission->resultOutcome->description,
                ] : null,
                'started_at' => $submission->started_at?->format('M d, Y H:i'),
                'submitted_at' => $submission->submitted_at?->format('M d, Y H:i'),
                'answers' => $submission->answers->map(fn ($a) => [
                    'id' => $a->id,
                    'question_text' => $a->question->question_text,
                    'question_type' => $a->question->type,
                    'answer_value' => $a->answer_value,
                    'answer_option_ids' => $a->answer_option_ids,
                    'score_value' => $a->score_value,
                    'selected_options' => $a->question->answerOptions
                        ->whereIn('id', $a->answer_option_ids ?? [])
                        ->pluck('label')
                        ->toArray(),
                ]),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $userId = Auth::id();
        $quizId = $request->get('quiz_id');

        $query = Submission::whereHas('quiz', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        })
        ->with(['quiz:id,title', 'lead', 'resultOutcome:id,name', 'answers.question'])
        ->completed();

        if ($quizId) {
            $query->where('quiz_id', $quizId);
        }

        $submissions = $query->latest('submitted_at')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="submissions-export-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($submissions) {
            $file = fopen('php://output', 'w');
            
            // Header row
            fputcsv($file, [
                'Submission ID',
                'Quiz',
                'Email',
                'Name',
                'Total Score',
                'Result',
                'Submitted At',
            ]);

            foreach ($submissions as $submission) {
                fputcsv($file, [
                    $submission->id,
                    $submission->quiz->title,
                    $submission->lead?->email ?? 'Anonymous',
                    $submission->lead?->full_name ?? 'Anonymous',
                    $submission->total_score,
                    $submission->resultOutcome?->name ?? '',
                    $submission->submitted_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    private function authorizeSubmissionAccess(Submission $submission): void
    {
        $userId = Auth::id();
        
        if ($submission->quiz->owner_id !== $userId) {
            abort(403, 'Unauthorized');
        }
    }
}
