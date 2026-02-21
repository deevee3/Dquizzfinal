<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $quizId = $request->get('quiz_id');

        $query = Lead::whereHas('quiz', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        })
        ->with(['quiz:id,title', 'submissions' => function ($q) {
            $q->completed()->latest('submitted_at')->take(1);
        }]);

        if ($quizId) {
            $query->where('quiz_id', $quizId);
        }

        $leads = $query->latest()
            ->paginate(20)
            ->through(fn ($lead) => [
                'id' => $lead->id,
                'email' => $lead->email,
                'first_name' => $lead->first_name,
                'last_name' => $lead->last_name,
                'full_name' => $lead->full_name,
                'phone' => $lead->phone,
                'quiz_title' => $lead->quiz->title,
                'quiz_id' => $lead->quiz_id,
                'latest_score' => $lead->submissions->first()?->total_score,
                'created_at' => $lead->created_at->format('M d, Y H:i'),
            ]);

        $quizzes = Quiz::where('owner_id', $userId)
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('leads/index', [
            'leads' => $leads,
            'quizzes' => $quizzes,
            'selectedQuizId' => $quizId ? (int) $quizId : null,
        ]);
    }

    public function show(Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $lead->load(['quiz:id,title', 'submissions.resultOutcome', 'submissions.answers.question']);

        return Inertia::render('leads/show', [
            'lead' => [
                'id' => $lead->id,
                'email' => $lead->email,
                'first_name' => $lead->first_name,
                'last_name' => $lead->last_name,
                'full_name' => $lead->full_name,
                'phone' => $lead->phone,
                'metadata' => $lead->metadata,
                'quiz' => $lead->quiz,
                'created_at' => $lead->created_at->format('M d, Y H:i'),
                'submissions' => $lead->submissions->map(fn ($s) => [
                    'id' => $s->id,
                    'total_score' => $s->total_score,
                    'dimension_scores' => $s->dimension_scores,
                    'outcome' => $s->resultOutcome?->name,
                    'submitted_at' => $s->submitted_at?->format('M d, Y H:i'),
                    'answers' => $s->answers->map(fn ($a) => [
                        'question' => $a->question->question_text,
                        'answer' => $a->answer_value,
                        'score' => $a->score_value,
                    ]),
                ]),
            ],
        ]);
    }

    public function destroy(Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $lead->submissions()->delete();
        $lead->delete();

        return redirect()->route('leads.index')
            ->with('success', 'Lead deleted successfully!');
    }

    public function export(Request $request)
    {
        $userId = Auth::id();
        $quizId = $request->get('quiz_id');

        $query = Lead::whereHas('quiz', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        })
        ->with(['quiz:id,title', 'submissions' => function ($q) {
            $q->completed()->latest('submitted_at')->take(1)->with('resultOutcome');
        }]);

        if ($quizId) {
            $query->where('quiz_id', $quizId);
        }

        $leads = $query->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="leads-export-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($leads) {
            $file = fopen('php://output', 'w');
            
            // Header row
            fputcsv($file, [
                'Email',
                'First Name',
                'Last Name',
                'Phone',
                'Quiz',
                'Score',
                'Result',
                'Date',
            ]);

            foreach ($leads as $lead) {
                $submission = $lead->submissions->first();
                fputcsv($file, [
                    $lead->email,
                    $lead->first_name,
                    $lead->last_name,
                    $lead->phone,
                    $lead->quiz->title,
                    $submission?->total_score ?? '',
                    $submission?->resultOutcome?->name ?? '',
                    $lead->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    private function authorizeLeadAccess(Lead $lead): void
    {
        $userId = Auth::id();
        
        if ($lead->quiz->owner_id !== $userId) {
            abort(403, 'Unauthorized');
        }
    }
}
