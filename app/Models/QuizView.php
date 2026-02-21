<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizView extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'quiz_id',
        'session_id',
        'ip_address',
        'user_agent',
        'referrer',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    /**
     * Get the quiz that was viewed.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }
}
