<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignEmail extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'campaign_step_id',
        'subscription_id',
        'to_email',
        'subject',
        'status',
        'resend_id',
        'error_message',
        'sent_at',
        'opened_at',
        'clicked_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(CampaignStep::class, 'campaign_step_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(CampaignSubscription::class, 'subscription_id');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
