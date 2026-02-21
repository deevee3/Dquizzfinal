<?php

namespace App\Mail;

use App\Models\Campaign;
use App\Models\CampaignStep;
use App\Models\CampaignSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CampaignStepEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Campaign $campaign,
        public CampaignStep $step,
        public CampaignSubscription $subscription
    ) {}

    public function envelope(): Envelope
    {
        $fromName = $this->campaign->from_name ?: config('mail.from.name');
        $fromEmail = $this->campaign->from_email ?: config('mail.from.address');

        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address($fromEmail, $fromName),
            subject: $this->parseContent($this->step->subject),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.campaign-step',
            with: [
                'content' => $this->parseContent($this->step->email_content),
                'campaign' => $this->campaign,
                'subscription' => $this->subscription,
                'quizUrl' => $this->step->quiz
                    ? url('/q/' . $this->step->quiz->slug)
                    : null,
            ],
        );
    }

    protected function parseContent(string $content): string
    {
        $replacements = [
            '{{first_name}}' => $this->subscription->first_name ?? '',
            '{{last_name}}' => $this->subscription->last_name ?? '',
            '{{email}}' => $this->subscription->email,
            '{{full_name}}' => $this->subscription->full_name,
        ];

        if ($this->step->quiz) {
            $replacements['{{quiz_url}}'] = url('/q/' . $this->step->quiz->slug);
            $replacements['{{quiz_title}}'] = $this->step->quiz->title;
        }

        return str_replace(array_keys($replacements), array_values($replacements), $content);
    }
}
