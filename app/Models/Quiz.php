<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quiz extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'title',
        'slug',
        'description',
        'status',
        'type',
        'brand_settings',
        'cta_settings',
        'lead_capture_mode',
    ];

    protected $casts = [
        'brand_settings' => 'array',
        'cta_settings' => 'array',
    ];

    /**
     * Get the owner of the quiz.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the questions for the quiz.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    /**
     * Get the result outcomes for the quiz.
     */
    public function resultOutcomes(): HasMany
    {
        return $this->hasMany(ResultOutcome::class)->orderBy('order');
    }

    /**
     * Get the leads for the quiz.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    /**
     * Get the submissions for the quiz.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Get the views for the quiz.
     */
    public function views(): HasMany
    {
        return $this->hasMany(QuizView::class);
    }

    /**
     * Check if quiz is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Scope for published quizzes.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for quizzes owned by a user.
     */
    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('owner_id', $userId);
    }
}
