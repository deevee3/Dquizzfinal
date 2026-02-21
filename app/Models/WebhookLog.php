<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'webhook_id',
        'event',
        'payload',
        'response_status',
        'response_body',
        'status',
        'attempts',
        'sent_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the webhook that owns the log.
     */
    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    /**
     * Check if delivery was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    /**
     * Check if delivery failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Mark as successful.
     */
    public function markAsSuccessful(int $statusCode, ?string $responseBody = null): void
    {
        $this->update([
            'status' => 'success',
            'response_status' => $statusCode,
            'response_body' => $responseBody,
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark as failed.
     */
    public function markAsFailed(int $statusCode, ?string $responseBody = null): void
    {
        $this->update([
            'status' => 'failed',
            'response_status' => $statusCode,
            'response_body' => $responseBody,
            'attempts' => $this->attempts + 1,
            'sent_at' => now(),
        ]);
    }
}
