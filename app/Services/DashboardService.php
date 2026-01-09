<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class DashboardService
{
    public function __construct(
        private AnalyticsService $analyticsService,
        private TransactionService $transactionService,
    ) {}

    public function getDashboardData(User $user, string $currency, ?string $timezone = null): array
    {
        $timezone = $timezone ?? $user->timezone ?? config('app.timezone');
        $analytics = $this->analyticsService->getDashboardData($user, $currency, $timezone);

        return [
            'totalBalance' => $this->transactionService->getTotalBalance($user, $currency),
            'today' => $analytics['today'],
            'thisMonth' => $analytics['thisMonth'],
            'thisYear' => $analytics['thisYear'],
            'byAccount' => $analytics['byAccount'],
            'byCategory' => $analytics['byCategory'],
            'byMerchant' => $analytics['byMerchant'],
            'trend' => $analytics['trend'],
            'recentTransactions' => $this->transactionService->getRecentTransactions($user, $currency),
        ];
    }
}
