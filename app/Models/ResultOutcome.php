<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResultOutcome extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'name',
        'description',
        'score_min',
        'score_max',
        'dimension_rules',
        'content_blocks',
        'cta_override',
        'order',
    ];

    protected $casts = [
        'score_min' => 'integer',
        'score_max' => 'integer',
        'dimension_rules' => 'array',
        'content_blocks' => 'array',
        'cta_override' => 'array',
    ];

    /**
     * Get the quiz that owns the result outcome.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the submissions with this outcome.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Check if a score falls within this outcome's range.
     */
    public function matchesScore(int $score): bool
    {
        if ($this->score_min !== null && $score < $this->score_min) {
            return false;
        }
        if ($this->score_max !== null && $score > $this->score_max) {
            return false;
        }
        return true;
    }
}
