<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('campaign_step_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->constrained('campaign_subscriptions')->onDelete('cascade');
            $table->string('to_email');
            $table->string('subject');
            $table->enum('status', ['pending', 'sent', 'failed', 'opened', 'clicked'])->default('pending');
            $table->string('resend_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_emails');
    }
};
