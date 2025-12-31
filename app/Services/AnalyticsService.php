<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AnalyticsAccountDaily;
use App\Models\AnalyticsCategoryDaily;
use App\Models\AnalyticsDaily;
use App\Models\AnalyticsMonthly;
use App\Models\AnalyticsYearly;
use App\Models\Transaction;
use App\Models\User;

class AnalyticsService
{
    public function updateOnTransaction(Transaction $transaction, ?Transaction $oldTransaction = null): void
    {
        if ($oldTransaction) {
            $this->revertTransaction($oldTransaction);
        }
        $this->applyTransaction($transaction);
    }

    public function deleteTransaction(Transaction $transaction): void
    {
        $this->revertTransaction($transaction);
    }

    private function applyTransaction(Transaction $transaction): void
    {
        $date = \Carbon\Carbon::parse($transaction->date);
        $isIncome = $transaction->amount >= 0;
        $amount = abs((float) $transaction->amount);
        $userId = $transaction->user_id;

        $this->updateDaily($userId, $date, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);
        $this->updateMonthly($userId, $date->year, $date->month, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);
        $this->updateYearly($userId, $date->year, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);

        if ($transaction->account_id) {
            $this->updateAccountDaily($userId, $transaction->account_id, $date, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);
        }

        if ($transaction->category_id) {
            $this->updateCategoryDaily($userId, $transaction->category_id, $date, $amount);
        }
    }

    private function revertTransaction(Transaction $transaction): void
    {
        $date = \Carbon\Carbon::parse($transaction->date);
        $isIncome = $transaction->amount >= 0;
        $amount = abs((float) $transaction->amount);
        $userId = $transaction->user_id;

        $this->updateDaily($userId, $date, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);
        $this->updateMonthly($userId, $date->year, $date->month, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);
        $this->updateYearly($userId, $date->year, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);

        if ($transaction->account_id) {
            $this->updateAccountDaily($userId, $transaction->account_id, $date, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);
        }

        if ($transaction->category_id) {
            $this->updateCategoryDaily($userId, $transaction->category_id, $date, -$amount);
        }
    }

    private function updateDaily(int $userId, \Carbon\Carbon $date, float $incomeChange, float $expenseChange): void
    {
        AnalyticsDaily::updateOrCreate(
            ['user_id' => $userId, 'date' => $date->toDateString()],
            ['income' => 0, 'expense' => 0]
        )->increment('income', $incomeChange);

        AnalyticsDaily::where('user_id', $userId)
            ->where('date', $date->toDateString())
            ->increment('expense', $expenseChange);
    }

    private function updateMonthly(int $userId, int $year, int $month, float $incomeChange, float $expenseChange): void
    {
        AnalyticsMonthly::updateOrCreate(
            ['user_id' => $userId, 'year' => $year, 'month' => $month],
            ['income' => 0, 'expense' => 0]
        )->increment('income', $incomeChange);

        AnalyticsMonthly::where('user_id', $userId)
            ->where('year', $year)
            ->where('month', $month)
            ->increment('expense', $expenseChange);
    }

    private function updateYearly(int $userId, int $year, float $incomeChange, float $expenseChange): void
    {
        AnalyticsYearly::updateOrCreate(
            ['user_id' => $userId, 'year' => $year],
            ['income' => 0, 'expense' => 0]
        )->increment('income', $incomeChange);

        AnalyticsYearly::where('user_id', $userId)
            ->where('year', $year)
            ->increment('expense', $expenseChange);
    }

    private function updateAccountDaily(int $userId, int $accountId, \Carbon\Carbon $date, float $incomeChange, float $expenseChange): void
    {
        AnalyticsAccountDaily::updateOrCreate(
            ['user_id' => $userId, 'account_id' => $accountId, 'date' => $date->toDateString()],
            ['income' => 0, 'expense' => 0]
        )->increment('income', $incomeChange);

        AnalyticsAccountDaily::where('user_id', $userId)
            ->where('account_id', $accountId)
            ->where('date', $date->toDateString())
            ->increment('expense', $expenseChange);
    }

    private function updateCategoryDaily(int $userId, int $categoryId, \Carbon\Carbon $date, float $amountChange): void
    {
        AnalyticsCategoryDaily::updateOrCreate(
            ['user_id' => $userId, 'category_id' => $categoryId, 'date' => $date->toDateString()],
            ['amount' => 0]
        )->increment('amount', $amountChange);
    }

    public function populateAll(User $user): void
    {
        $transactions = $user->transactions()
            ->with(['account', 'category'])
            ->get();

        foreach ($transactions as $transaction) {
            $this->applyTransaction($transaction);
        }
    }

    public function getDashboardData(User $user): array
    {
        $today = now()->toDateString();
        $startOfMonth = now()->startOfMonth()->toDateString();
        $startOfYear = now()->startOfYear()->toDateString();

        $daily = AnalyticsDaily::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        $monthly = AnalyticsMonthly::where('user_id', $user->id)
            ->where('year', now()->year)
            ->where('month', now()->month)
            ->first();

        $yearly = AnalyticsYearly::where('user_id', $user->id)
            ->where('year', now()->year)
            ->first();

        $monthlyByAccount = AnalyticsAccountDaily::where('analytics_account_daily.user_id', $user->id)
            ->whereBetween('analytics_account_daily.date', [$startOfMonth, $today])
            ->join('accounts', 'analytics_account_daily.account_id', '=', 'accounts.id')
            ->select('accounts.name', 'accounts.color')
            ->selectRaw('SUM(analytics_account_daily.income) as income, SUM(analytics_account_daily.expense) as expense')
            ->groupBy('analytics_account_daily.account_id')
            ->get();

        $monthlyByCategory = AnalyticsCategoryDaily::where('analytics_category_daily.user_id', $user->id)
            ->whereBetween('analytics_category_daily.date', [$startOfMonth, $today])
            ->join('categories', 'analytics_category_daily.category_id', '=', 'categories.id')
            ->select('categories.name')
            ->selectRaw('SUM(analytics_category_daily.amount) as total')
            ->groupBy('analytics_category_daily.category_id')
            ->orderByDesc('total')
            ->get();

        $incomeTrend = AnalyticsDaily::where('user_id', $user->id)
            ->where('date', '>=', now()->subDays(30)->toDateString())
            ->orderBy('date')
            ->get()
            ->map(fn ($item) => [
                'date' => $item->date,
                'income' => (float) $item->income,
                'expense' => (float) $item->expense,
            ]);

        return [
            'today' => [
                'income' => (float) ($daily?->income ?? 0),
                'expense' => (float) ($daily?->expense ?? 0),
            ],
            'thisMonth' => [
                'income' => (float) ($monthly?->income ?? 0),
                'expense' => (float) ($monthly?->expense ?? 0),
            ],
            'thisYear' => [
                'income' => (float) ($yearly?->income ?? 0),
                'expense' => (float) ($yearly?->expense ?? 0),
            ],
            'byAccount' => $monthlyByAccount,
            'byCategory' => $monthlyByCategory,
            'trend' => $incomeTrend,
        ];
    }
}
