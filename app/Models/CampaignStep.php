<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampaignStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'quiz_id',
        'order',
        'type',
        'subject',
        'email_content',
        'delay_days',
        'delay_hours',
    ];

    protected $casts = [
        'delay_days' => 'integer',
        'delay_hours' => 'integer',
        'order' => 'integer',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function emails(): HasMany
    {
        return $this->hasMany(CampaignEmail::class);
    }

    public function getDelayInMinutes(): int
    {
        return ($this->delay_days * 24 * 60) + ($this->delay_hours * 60);
    }

    public function isEmail(): bool
    {
        return $this->type === 'email';
    }

    public function isQuiz(): bool
    {
        return $this->type === 'quiz';
    }
}
