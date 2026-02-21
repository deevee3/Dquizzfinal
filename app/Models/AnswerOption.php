<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnswerOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'label',
        'value',
        'score_value',
        'order',
    ];

    protected $casts = [
        'score_value' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Get the question that owns the answer option.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
