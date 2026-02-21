<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'structure',
        'thumbnail_url',
        'is_active',
    ];

    protected $casts = [
        'structure' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for templates by category.
     */
    public function scopeInCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
