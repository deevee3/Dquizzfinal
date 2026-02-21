<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Marketing Maturity Scorecard"
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // lead_gen, waitlist, webinar_qualifier
            $table->json('structure'); // JSON to generate quiz, questions, outcomes
            $table->string('thumbnail_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
