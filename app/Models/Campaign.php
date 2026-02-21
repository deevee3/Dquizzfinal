<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'trigger_quiz_id',
        'name',
        'description',
        'status',
        'from_name',
        'from_email',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function triggerQuiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'trigger_quiz_id');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(CampaignStep::class)->orderBy('order');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(CampaignSubscription::class);
    }

    public function emails(): HasMany
    {
        return $this->hasMany(CampaignEmail::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('owner_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
