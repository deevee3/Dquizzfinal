<?php

namespace App\Jobs;

use App\Mail\CampaignStepEmail;
use App\Models\Campaign;
use App\Models\CampaignEmail;
use App\Models\CampaignSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class ProcessCampaignEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $subscriptions = CampaignSubscription::readyToSend()
            ->with(['campaign', 'currentStep.quiz'])
            ->whereHas('campaign', fn ($q) => $q->active())
            ->get();

        foreach ($subscriptions as $subscription) {
            $this->processSubscription($subscription);
        }
    }

    protected function processSubscription(CampaignSubscription $subscription): void
    {
        $step = $subscription->currentStep;
        $campaign = $subscription->campaign;

        if (!$step || !$campaign->isActive()) {
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

            // Move to next step
            $this->advanceToNextStep($subscription, $step);

        } catch (\Exception $e) {
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
