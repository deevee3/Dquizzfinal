<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampaignSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'lead_id',
        'email',
        'first_name',
        'last_name',
        'current_step_id',
        'status',
        'next_send_at',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected $casts = [
        'next_send_at' => 'datetime',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(CampaignStep::class, 'current_step_id');
    }

    public function emails(): HasMany
    {
        return $this->hasMany(CampaignEmail::class, 'subscription_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}") ?: $this->email;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeReadyToSend($query)
    {
        return $query->active()
            ->whereNotNull('next_send_at')
            ->where('next_send_at', '<=', now());
    }
}
