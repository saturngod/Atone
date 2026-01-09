<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AnalyticsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

final class AnalyticsRefresh extends Command
{
    protected $signature = 'analytics:refresh {--user-id= : Specific user ID to refresh (optional)}';

    protected $description = 'Clear all analytics data and recalculate from transactions';

    public function __construct(
        private AnalyticsService $analyticsService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $userId = $this->option('user-id');

        if ($userId) {
            return $this->refreshUser((int) $userId);
        }

        return $this->refreshAll();
    }

    private function refreshAll(): int
    {
        $this->info('Refreshing analytics for all users...');

        $users = User::all();
        $bar = $this->output->createProgressBar($users->count());

        $bar->start();

        foreach ($users as $user) {
            $this->refreshUserAnalytics($user->id);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Analytics refreshed for {$users->count()} user(s).");

        return self::SUCCESS;
    }

    private function refreshUser(int $userId): int
    {
        $user = User::find($userId);

        if (! $user) {
            $this->error("User with ID {$userId} not found.");

            return self::FAILURE;
        }

        $this->info("Refreshing analytics for user: {$user->name} (ID: {$user->id})");

        $this->refreshUserAnalytics($userId);

        $this->info('Analytics refreshed successfully.');

        return self::SUCCESS;
    }

    private function refreshUserAnalytics(int $userId): void
    {
        DB::transaction(function () use ($userId) {
            // Clear all analytics data for the user
            DB::table('analytics_daily')->where('user_id', $userId)->delete();
            DB::table('analytics_monthly')->where('user_id', $userId)->delete();
            DB::table('analytics_yearly')->where('user_id', $userId)->delete();
            DB::table('analytics_account_daily')->where('user_id', $userId)->delete();
            DB::table('analytics_account_monthly')->where('user_id', $userId)->delete();
            DB::table('analytics_account_yearly')->where('user_id', $userId)->delete();
            DB::table('analytics_category_daily')->where('user_id', $userId)->delete();
            DB::table('analytics_category_monthly')->where('user_id', $userId)->delete();
            DB::table('analytics_category_yearly')->where('user_id', $userId)->delete();
            DB::table('analytics_merchant_daily')->where('user_id', $userId)->delete();
            DB::table('analytics_merchant_monthly')->where('user_id', $userId)->delete();
            DB::table('analytics_merchant_yearly')->where('user_id', $userId)->delete();

            // Recalculate from transactions
            $user = User::find($userId);
            $this->analyticsService->populateAll($user);
        });
    }
}
