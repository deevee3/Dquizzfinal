<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\CampaignStep;
use App\Models\CampaignSubscription;
use App\Models\Lead;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        $campaigns = Campaign::where('owner_id', $userId)
            ->with('triggerQuiz:id,title,slug')
            ->withCount(['steps', 'subscriptions', 'emails'])
            ->latest()
            ->paginate(10)
            ->through(fn ($campaign) => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'status' => $campaign->status,
                'trigger_quiz' => $campaign->triggerQuiz ? [
                    'id' => $campaign->triggerQuiz->id,
                    'title' => $campaign->triggerQuiz->title,
                    'slug' => $campaign->triggerQuiz->slug,
                ] : null,
                'steps_count' => $campaign->steps_count,
                'subscriptions_count' => $campaign->subscriptions_count,
                'emails_count' => $campaign->emails_count,
                'created_at' => $campaign->created_at->format('M d, Y'),
            ]);

        return Inertia::render('campaigns/index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create()
    {
        $quizzes = Quiz::where('owner_id', Auth::id())
            ->published()
            ->select('id', 'title', 'slug')
            ->get();

        return Inertia::render('campaigns/create', [
            'quizzes' => $quizzes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_quiz_id' => ['nullable', Rule::exists('quizzes', 'id')->where('owner_id', $request->user()->id)],
            'from_name' => 'nullable|string|max:255',
            'from_email' => 'nullable|email|max:255',
        ]);

        $campaign = Campaign::create([
            'owner_id' => Auth::id(),
            ...$validated,
            'status' => 'draft',
        ]);

        return redirect()->route('campaigns.edit', $campaign->id)
            ->with('success', 'Campaign created successfully!');
    }

    public function edit(Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $campaign->load(['steps.quiz']);

        $quizzes = Quiz::where('owner_id', Auth::id())
            ->published()
            ->select('id', 'title', 'slug')
            ->get();

        return Inertia::render('campaigns/edit', [
            'campaign' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'status' => $campaign->status,
                'trigger_quiz_id' => $campaign->trigger_quiz_id,
                'from_name' => $campaign->from_name,
                'from_email' => $campaign->from_email,
                'steps' => $campaign->steps->map(fn ($step) => [
                    'id' => $step->id,
                    'order' => $step->order,
                    'type' => $step->type,
                    'subject' => $step->subject,
                    'email_content' => $step->email_content,
                    'delay_days' => $step->delay_days,
                    'delay_hours' => $step->delay_hours,
                    'quiz_id' => $step->quiz_id,
                    'quiz' => $step->quiz ? [
                        'id' => $step->quiz->id,
                        'title' => $step->quiz->title,
                        'slug' => $step->quiz->slug,
                    ] : null,
                ]),
            ],
            'quizzes' => $quizzes,
        ]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_quiz_id' => ['nullable', Rule::exists('quizzes', 'id')->where('owner_id', $request->user()->id)],
            'from_name' => 'nullable|string|max:255',
            'from_email' => 'nullable|email|max:255',
        ]);

        $campaign->update($validated);

        return back()->with('success', 'Campaign updated successfully!');
    }

    public function updateStatus(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'status' => 'required|in:draft,active,paused,completed',
        ]);

        $campaign->update(['status' => $validated['status']]);

        return back()->with('success', 'Campaign status updated!');
    }

    public function destroy(Campaign $campaign)
    {
        $this->authorize('delete', $campaign);

        $campaign->delete();

        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign deleted successfully!');
    }

    // Step management
    public function storeStep(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'type' => 'required|in:email,quiz,delay',
            'subject' => 'required_if:type,email|nullable|string|max:255',
            'email_content' => 'required_if:type,email|nullable|string',
            'quiz_id' => ['required_if:type,quiz', 'nullable', Rule::exists('quizzes', 'id')->where('owner_id', $request->user()->id)],
            'delay_days' => 'nullable|integer|min:0',
            'delay_hours' => 'nullable|integer|min:0|max:23',
        ]);

        $maxOrder = $campaign->steps()->max('order') ?? 0;

        $campaign->steps()->create([
            ...$validated,
            'order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Step added!');
    }

    public function updateStep(Request $request, Campaign $campaign, CampaignStep $step)
    {
        $this->authorize('update', $campaign);
        abort_unless((int) $step->campaign_id === (int) $campaign->id, 404);

        $validated = $request->validate([
            'type' => 'required|in:email,quiz,delay',
            'subject' => 'required_if:type,email|nullable|string|max:255',
            'email_content' => 'required_if:type,email|nullable|string',
            'quiz_id' => ['required_if:type,quiz', 'nullable', Rule::exists('quizzes', 'id')->where('owner_id', $request->user()->id)],
            'delay_days' => 'nullable|integer|min:0',
            'delay_hours' => 'nullable|integer|min:0|max:23',
        ]);

        $step->update($validated);

        return back()->with('success', 'Step updated!');
    }

    public function destroyStep(Campaign $campaign, CampaignStep $step)
    {
        $this->authorize('update', $campaign);
        abort_unless((int) $step->campaign_id === (int) $campaign->id, 404);

        $step->delete();

        return back()->with('success', 'Step deleted!');
    }

    public function reorderSteps(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'steps' => 'required|array',
            'steps.*.id' => 'required|integer',
            'steps.*.order' => 'required|integer',
        ]);

        foreach ($validated['steps'] as $item) {
            CampaignStep::where('id', $item['id'])
                ->where('campaign_id', $campaign->id)
                ->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Steps reordered!');
    }

    // Subscription management
    public function subscriptions(Campaign $campaign)
    {
        $this->authorize('view', $campaign);

        $subscriptions = $campaign->subscriptions()
            ->with(['currentStep', 'lead'])
            ->latest()
            ->paginate(20)
            ->through(fn ($sub) => [
                'id' => $sub->id,
                'email' => $sub->email,
                'first_name' => $sub->first_name,
                'last_name' => $sub->last_name,
                'full_name' => $sub->full_name,
                'status' => $sub->status,
                'current_step' => $sub->currentStep?->order,
                'subscribed_at' => $sub->subscribed_at?->format('M d, Y H:i'),
                'next_send_at' => $sub->next_send_at?->format('M d, Y H:i'),
            ]);

        // Get eligible leads from the trigger quiz who aren't already subscribed
        $eligibleLeads = [];
        if ($campaign->trigger_quiz_id) {
            $subscribedEmails = $campaign->subscriptions()->pluck('email')->toArray();
            $eligibleLeads = Lead::where('quiz_id', $campaign->trigger_quiz_id)
                ->whereNotIn('email', $subscribedEmails)
                ->get()
                ->map(fn ($lead) => [
                    'id' => $lead->id,
                    'email' => $lead->email,
                    'full_name' => $lead->full_name,
                ]);
        }

        return Inertia::render('campaigns/subscriptions', [
            'campaign' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'status' => $campaign->status,
                'trigger_quiz_id' => $campaign->trigger_quiz_id,
            ],
            'subscriptions' => $subscriptions,
            'eligibleLeads' => $eligibleLeads,
        ]);
    }

    public function addSubscriber(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
        ]);

        // Verify the lead is from the campaign's trigger quiz
        $lead = Lead::whereKey($validated['lead_id'])
            ->whereHas('quiz', fn ($q) => $q->where('owner_id', $request->user()->id))
            ->firstOrFail();
        
        if ($campaign->trigger_quiz_id && $lead->quiz_id !== $campaign->trigger_quiz_id) {
            return back()->withErrors(['lead_id' => 'This lead is not from the trigger quiz.']);
        }

        // Check if already subscribed
        $existing = $campaign->subscriptions()->where('email', $lead->email)->first();
        if ($existing) {
            return back()->withErrors(['lead_id' => 'This lead is already subscribed.']);
        }

        $firstStep = $campaign->steps()->orderBy('order')->first();

        $campaign->subscriptions()->create([
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'first_name' => $lead->first_name,
            'last_name' => $lead->last_name,
            'status' => 'active',
            'current_step_id' => $firstStep?->id,
            'subscribed_at' => now(),
            'next_send_at' => now()->addMinutes($firstStep?->getDelayInMinutes() ?? 0),
        ]);

        return back()->with('success', 'Subscriber added!');
    }

    public function removeSubscriber(Campaign $campaign, CampaignSubscription $subscription)
    {
        $this->authorize('update', $campaign);
        abort_unless((int) $subscription->campaign_id === (int) $campaign->id, 404);

        $subscription->update([
            'status' => 'unsubscribed',
            'unsubscribed_at' => now(),
        ]);

        return back()->with('success', 'Subscriber removed!');
    }

    // Analytics
    public function analytics(Campaign $campaign)
    {
        $this->authorize('view', $campaign);

        $stats = [
            'total_subscribers' => $campaign->subscriptions()->count(),
            'active_subscribers' => $campaign->subscriptions()->active()->count(),
            'total_emails_sent' => $campaign->emails()->sent()->count(),
            'total_opens' => $campaign->emails()->where('status', 'opened')->count(),
            'total_clicks' => $campaign->emails()->where('status', 'clicked')->count(),
            'open_rate' => $campaign->emails()->sent()->count() > 0
                ? round(($campaign->emails()->whereNotNull('opened_at')->count() / $campaign->emails()->sent()->count()) * 100, 1)
                : 0,
        ];

        return Inertia::render('campaigns/analytics', [
            'campaign' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'status' => $campaign->status,
            ],
            'stats' => $stats,
        ]);
    }
}
