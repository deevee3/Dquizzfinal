<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('quiz_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('order')->default(0);
            $table->enum('type', ['email', 'quiz', 'delay'])->default('email');
            $table->string('subject')->nullable();
            $table->text('email_content')->nullable();
            $table->integer('delay_days')->default(0); // Delay before this step is executed
            $table->integer('delay_hours')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_steps');
    }
};
