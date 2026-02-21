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
        Schema::create('result_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->string('name'); // e.g., "Strategic Starter"
            $table->text('description'); // Long-form text explaining the result
            $table->integer('score_min')->nullable(); // Minimum score for this outcome
            $table->integer('score_max')->nullable(); // Maximum score for this outcome
            $table->json('dimension_rules')->nullable(); // Advanced: rules per dimension
            $table->json('content_blocks')->nullable(); // Next steps, resource links, etc.
            $table->json('cta_override')->nullable(); // Optional specific CTA label + URL
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['quiz_id', 'score_min', 'score_max']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('result_outcomes');
    }
};
