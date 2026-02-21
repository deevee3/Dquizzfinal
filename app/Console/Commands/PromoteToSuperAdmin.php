<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteToSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'user:promote-super-admin
                            {email : The email of the user to promote}
                            {--demote : Demote the user instead of promoting}';

    /**
     * The console command description.
     */
    protected $description = 'Promote (or demote) a user to super admin status';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $demote = $this->option('demote');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No user found with email: {$email}");
            return self::FAILURE;
        }

        $user->update(['is_super_admin' => ! $demote]);

        $action = $demote ? 'demoted from' : 'promoted to';
        $this->info("User {$user->name} ({$email}) has been {$action} super admin.");

        return self::SUCCESS;
    }
}
