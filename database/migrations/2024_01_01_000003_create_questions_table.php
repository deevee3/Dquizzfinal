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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->enum('type', ['single_choice', 'multiple_choice', 'scale', 'open_text'])->default('single_choice');
            $table->text('question_text');
            $table->text('help_text')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('required')->default(true);
            $table->string('scoring_dimension')->nullable(); // e.g., Strategy, Execution, Systems
            $table->json('metadata')->nullable(); // For advanced question types
            $table->timestamps();

            $table->index(['quiz_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
