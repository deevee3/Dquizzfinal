<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->foreignId('trigger_quiz_id')->nullable()->after('owner_id')->constrained('quizzes')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropForeign(['trigger_quiz_id']);
            $table->dropColumn('trigger_quiz_id');
        });
    }
};
