<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'question_id',
        'answer_value',
        'answer_option_ids',
        'score_value',
    ];

    protected $casts = [
        'answer_option_ids' => 'array',
        'score_value' => 'integer',
    ];

    /**
     * Get the submission that owns the answer.
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    /**
     * Get the question for the answer.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the selected answer options.
     */
    public function selectedOptions()
    {
        if (empty($this->answer_option_ids)) {
            return collect();
        }

        return AnswerOption::whereIn('id', $this->answer_option_ids)->get();
    }
}
