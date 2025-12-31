<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $totalBalance = $user
            ->accounts()
            ->withSum('transactions', 'amount')
            ->get()
            ->sum(fn ($account) => $account->transactions_sum_amount ?? 0);

        $analytics = $this->analyticsService->getDashboardData($user);

        $recentTransactions = $user
            ->transactions()
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'totalBalance' => (float) $totalBalance,
            'today' => $analytics['today'],
            'thisMonth' => $analytics['thisMonth'],
            'thisYear' => $analytics['thisYear'],
            'byAccount' => $analytics['byAccount'],
            'byCategory' => $analytics['byCategory'],
            'trend' => $analytics['trend'],
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
