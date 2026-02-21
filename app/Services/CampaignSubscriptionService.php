<?php

namespace App\Services;

use App\Jobs\SendSubscriptionEmail;
use App\Models\Campaign;
use App\Models\CampaignSubscription;
use App\Models\Lead;
use App\Models\Quiz;
use Illuminate\Support\Facades\Log;

class CampaignSubscriptionService
{
    /**
     * Subscribe a lead to all active campaigns triggered by the given quiz.
     */
    public function subscribeFromQuiz(Quiz $quiz, Lead $lead): array
    {
        $subscribedCampaigns = [];

        // Find all active campaigns triggered by this quiz
        $campaigns = Campaign::where('trigger_quiz_id', $quiz->id)
            ->active()
            ->with('steps')
            ->get();

        foreach ($campaigns as $campaign) {
            $subscription = $this->subscribe($campaign, $lead);
            if ($subscription) {
                $subscribedCampaigns[] = $campaign;
            }
        }

        return $subscribedCampaigns;
    }

    /**
     * Subscribe a lead to a specific campaign.
     */
    public function subscribe(Campaign $campaign, Lead $lead): ?CampaignSubscription
    {
        // Don't re-subscribe if already subscribed
        $existing = $campaign->subscriptions()
            ->where('email', $lead->email)
            ->first();

        if ($existing) {
            // If previously unsubscribed, don't re-subscribe automatically
            if ($existing->status === 'unsubscribed') {
                return null;
            }
            return $existing;
        }

        $firstStep = $campaign->steps()->orderBy('order')->first();
        $delayMinutes = $firstStep?->getDelayInMinutes() ?? 0;

        $subscription = $campaign->subscriptions()->create([
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'first_name' => $lead->first_name,
            'last_name' => $lead->last_name,
            'current_step_id' => $firstStep?->id,
            'status' => 'active',
            'subscribed_at' => now(),
            'next_send_at' => now()->addMinutes($delayMinutes),
        ]);

        // If the first step has no delay, send email immediately (synchronously)
        if ($firstStep && $delayMinutes === 0) {
            Log::info('CampaignSubscriptionService: Sending immediate email', [
                'subscription_id' => $subscription->id,
                'campaign_id' => $campaign->id,
                'email' => $lead->email,
            ]);
            // Use dispatchSync to send immediately without waiting for queue worker
            SendSubscriptionEmail::dispatchSync($subscription);
        }

        return $subscription;
    }
}
