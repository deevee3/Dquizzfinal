<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Add an unguessable per-submission view token so public result URLs
     * can't be enumerated by incrementing integer IDs (IDOR fix, 2026-10-19).
     */
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('view_token', 64)->nullable()->unique()->after('id');
        });

        // Backfill any existing rows (none expected in production yet).
        DB::table('submissions')->whereNull('view_token')->orderBy('id')->each(function ($row) {
            DB::table('submissions')->where('id', $row->id)->update([
                'view_token' => Str::random(40),
            ]);
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->string('view_token', 64)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropUnique(['view_token']);
            $table->dropColumn('view_token');
        });
    }
};
