<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Webhook extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'url',
        'secret',
        'events',
        'is_active',
    ];

    protected $casts = [
        'events' => 'array',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'secret',
    ];

    /**
     * Get the logs for the webhook.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    /**
     * Scope for active webhooks.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if webhook should be triggered for an event.
     */
    public function shouldTriggerFor(string $event): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // If no events specified, trigger for all
        if (empty($this->events)) {
            return true;
        }

        return in_array($event, $this->events);
    }
}
