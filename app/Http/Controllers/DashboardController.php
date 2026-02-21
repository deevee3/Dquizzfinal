<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Quiz;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // Fetch stats
        $stats = [
            'total_quizzes' => Quiz::where('owner_id', $userId)->count(),
            'total_leads' => Lead::whereHas('quiz', function ($query) use ($userId) {
                $query->where('owner_id', $userId);
            })->count(),
            'total_completions' => Submission::whereHas('quiz', function ($query) use ($userId) {
                $query->where('owner_id', $userId);
            })->count(),
        ];

        // Fetch recent quizzes
        $recentQuizzes = Quiz::where('owner_id', $userId)
            ->latest()
            ->take(5)
            ->withCount(['leads', 'submissions'])
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'status' => $quiz->status,
                    'created_at' => $quiz->created_at->format('M d, Y'),
                    'leads_count' => $quiz->leads_count,
                    'submissions_count' => $quiz->submissions_count,
                    // 'edit_url' => route('quizzes.edit', $quiz->id), // Commented out until route exists
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentQuizzes' => $recentQuizzes,
        ]);
    }
}
