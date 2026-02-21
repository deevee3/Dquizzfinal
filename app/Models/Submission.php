<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'lead_id',
        'result_outcome_id',
        'total_score',
        'dimension_scores',
        'ip_address',
        'user_agent',
        'started_at',
        'submitted_at',
    ];

    protected $casts = [
        'dimension_scores' => 'array',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the quiz for the submission.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the lead for the submission.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the result outcome for the submission.
     */
    public function resultOutcome(): BelongsTo
    {
        return $this->belongsTo(ResultOutcome::class);
    }

    /**
     * Get the answers for the submission.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(SubmissionAnswer::class);
    }

    /**
     * Check if submission is complete.
     */
    public function isComplete(): bool
    {
        return $this->submitted_at !== null;
    }

    /**
     * Scope for completed submissions.
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('submitted_at');
    }
}
