<?php

use App\Jobs\ProcessCampaignEmails;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('campaigns:process', function () {
    ProcessCampaignEmails::dispatch();
    $this->info('Campaign emails are being processed.');
})->purpose('Process pending campaign emails');

// Schedule the campaign processing every 5 minutes
Schedule::job(new ProcessCampaignEmails)->everyFiveMinutes();
