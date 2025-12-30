<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $totalBalance = $user
            ->accounts()
            ->withSum('transactions', 'amount')
            ->get()
            ->sum(fn($account) => $account->transactions_sum_amount ?? 0);

        $currentMonthIncome = $user
            ->transactions()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->where('amount', '>', 0)
            ->sum('amount');

        $currentMonthExpenses = $user
            ->transactions()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->where('amount', '<', 0)
            ->sum('amount');

        $recentTransactions = $user
            ->transactions()
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'totalBalance' => (float) $totalBalance,
            'currentMonthIncome' => (float) $currentMonthIncome,
            'currentMonthExpenses' => abs((float) $currentMonthExpenses),
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
