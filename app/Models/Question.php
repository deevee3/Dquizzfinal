<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'type',
        'question_text',
        'help_text',
        'order',
        'required',
        'scoring_dimension',
        'metadata',
    ];

    protected $casts = [
        'required' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the quiz that owns the question.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the answer options for the question.
     */
    public function answerOptions(): HasMany
    {
        return $this->hasMany(AnswerOption::class)->orderBy('order');
    }

    /**
     * Get the submission answers for the question.
     */
    public function submissionAnswers(): HasMany
    {
        return $this->hasMany(SubmissionAnswer::class);
    }

    /**
     * Check if question has choices (single or multiple choice).
     */
    public function hasChoices(): bool
    {
        return in_array($this->type, ['single_choice', 'multiple_choice']);
    }

    /**
     * Check if question is a scale type.
     */
    public function isScale(): bool
    {
        return $this->type === 'scale';
    }

    /**
     * Check if question is open text.
     */
    public function isOpenText(): bool
    {
        return $this->type === 'open_text';
    }
}
