<?php

namespace App\Jobs;

use App\Mail\CampaignStepEmail;
use App\Models\CampaignEmail;
use App\Models\CampaignSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSubscriptionEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CampaignSubscription $subscription
    ) {}

    public function handle(): void
    {
        $subscription = $this->subscription->fresh(['campaign', 'currentStep']);
        
        if (!$subscription || !$subscription->isActive()) {
            Log::info('SendSubscriptionEmail: Subscription not active', ['id' => $this->subscription->id]);
            return;
        }

        $step = $subscription->currentStep;
        $campaign = $subscription->campaign;

        if (!$step || !$campaign?->isActive()) {
            Log::info('SendSubscriptionEmail: No step or campaign not active', [
                'subscription_id' => $subscription->id,
                'has_step' => (bool) $step,
                'campaign_active' => $campaign?->isActive(),
            ]);
            return;
        }

        // Check if it's time to send
        if ($subscription->next_send_at && $subscription->next_send_at->isFuture()) {
            Log::info('SendSubscriptionEmail: Not yet time to send', [
                'subscription_id' => $subscription->id,
                'next_send_at' => $subscription->next_send_at,
            ]);
            return;
        }

        // Create email record
        $emailRecord = CampaignEmail::create([
            'campaign_id' => $campaign->id,
            'campaign_step_id' => $step->id,
            'subscription_id' => $subscription->id,
            'to_email' => $subscription->email,
            'subject' => $step->subject ?? 'Check out this quiz!',
            'status' => 'pending',
        ]);

        try {
            // Send the email
            $mail = new CampaignStepEmail($campaign, $step, $subscription);
            Mail::to($subscription->email)->send($mail);

            // Update email record
            $emailRecord->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            Log::info('SendSubscriptionEmail: Email sent successfully', [
                'subscription_id' => $subscription->id,
                'email' => $subscription->email,
                'step_id' => $step->id,
            ]);

            // Move to next step
            $this->advanceToNextStep($subscription, $step);

        } catch (\Exception $e) {
            Log::error('SendSubscriptionEmail: Failed to send email', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);

            $emailRecord->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    protected function advanceToNextStep(CampaignSubscription $subscription, $currentStep): void
    {
        $nextStep = $subscription->campaign->steps()
            ->where('order', '>', $currentStep->order)
            ->orderBy('order')
            ->first();

        if ($nextStep) {
            $subscription->update([
                'current_step_id' => $nextStep->id,
                'next_send_at' => now()->addMinutes($nextStep->getDelayInMinutes()),
            ]);
        } else {
            // Campaign completed for this subscriber
            $subscription->update([
                'status' => 'completed',
                'current_step_id' => null,
                'next_send_at' => null,
            ]);
        }
    }
}
