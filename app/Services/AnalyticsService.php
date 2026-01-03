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
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

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

    public function applyTransaction(Transaction $transaction): void
    {
        $date = Carbon::parse($transaction->date);
        $isIncome = $transaction->amount >= 0;
        $amount = abs((float) $transaction->amount);
        $userId = $transaction->user_id;
        $currency = $transaction->account->currency_code; // Account must exist and have currency

        $this->updateDaily($userId, $date, $currency, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);
        $this->updateMonthly($userId, $date->year, $date->month, $currency, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);
        $this->updateYearly($userId, $date->year, $currency, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);

        if ($transaction->account_id) {
            $this->updateAccountDaily($userId, $transaction->account_id, $date, $currency, $isIncome ? $amount : 0, $isIncome ? 0 : $amount);
        }

        if ($transaction->category_id) {
            $this->updateCategoryDaily($userId, $transaction->category_id, $date, $currency, $amount);
        }
    }

    public function revertTransaction(Transaction $transaction): void
    {
        $date = Carbon::parse($transaction->date);
        $isIncome = $transaction->amount >= 0;
        $amount = abs((float) $transaction->amount);
        $userId = $transaction->user_id;
        $currency = $transaction->account->currency_code;

        $this->updateDaily($userId, $date, $currency, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);
        $this->updateMonthly($userId, $date->year, $date->month, $currency, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);
        $this->updateYearly($userId, $date->year, $currency, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);

        if ($transaction->account_id) {
            $this->updateAccountDaily($userId, $transaction->account_id, $date, $currency, $isIncome ? -$amount : 0, $isIncome ? 0 : -$amount);
        }

        if ($transaction->category_id) {
            $this->updateCategoryDaily($userId, $transaction->category_id, $date, $currency, -$amount);
        }
    }

    private function updateDaily(int $userId, Carbon $date, string $currency, float $incomeChange, float $expenseChange): void
    {
        $dateStr = $date->toDateString();

        AnalyticsDaily::upsert(
            [
                'user_id' => $userId,
                'date' => $dateStr,
                'currency' => $currency,
                'income' => $incomeChange,
                'expense' => $expenseChange,
            ],
            ['user_id', 'date', 'currency'],
            [
                'income' => DB::raw("analytics_daily.income + $incomeChange"),
                'expense' => DB::raw("analytics_daily.expense + $expenseChange"),
            ]
        );
    }

    private function updateMonthly(int $userId, int $year, int $month, string $currency, float $incomeChange, float $expenseChange): void
    {
        AnalyticsMonthly::upsert(
            [
                'user_id' => $userId,
                'year' => $year,
                'month' => $month,
                'currency' => $currency,
                'income' => $incomeChange,
                'expense' => $expenseChange,
            ],
            ['user_id', 'year', 'month', 'currency'],
            [
                'income' => DB::raw("analytics_monthly.income + $incomeChange"),
                'expense' => DB::raw("analytics_monthly.expense + $expenseChange"),
            ]
        );
    }

    private function updateYearly(int $userId, int $year, string $currency, float $incomeChange, float $expenseChange): void
    {
        AnalyticsYearly::upsert(
            [
                'user_id' => $userId,
                'year' => $year,
                'currency' => $currency,
                'income' => $incomeChange,
                'expense' => $expenseChange,
            ],
            ['user_id', 'year', 'currency'],
            [
                'income' => DB::raw("analytics_yearly.income + $incomeChange"),
                'expense' => DB::raw("analytics_yearly.expense + $expenseChange"),
            ]
        );
    }

    private function updateAccountDaily(int $userId, int $accountId, Carbon $date, string $currency, float $incomeChange, float $expenseChange): void
    {
        $dateStr = $date->toDateString();

        AnalyticsAccountDaily::upsert(
            [
                'user_id' => $userId,
                'account_id' => $accountId,
                'date' => $dateStr,
                'currency' => $currency,
                'income' => $incomeChange,
                'expense' => $expenseChange,
            ],
            ['user_id', 'account_id', 'date'],
            [
                'income' => DB::raw("analytics_account_daily.income + $incomeChange"),
                'expense' => DB::raw("analytics_account_daily.expense + $expenseChange"),
            ]
        );
    }

    private function updateCategoryDaily(int $userId, int $categoryId, Carbon $date, string $currency, float $amountChange): void
    {
        $dateStr = $date->toDateString();

        AnalyticsCategoryDaily::upsert(
            [
                'user_id' => $userId,
                'category_id' => $categoryId,
                'date' => $dateStr,
                'currency' => $currency,
                'amount' => $amountChange,
            ],
            ['user_id', 'category_id', 'date', 'currency'],
            [
                'amount' => DB::raw("analytics_category_daily.amount + $amountChange"),
            ]
        );
    }

    private function atomicUpdate(string $modelClass, array $keys, array $changes): void
    {
        $maxRetries = 5;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $existing = $modelClass::where($keys)->first();

                if ($existing) {
                    foreach ($changes as $field => $change) {
                        $existing->$field += $change;
                    }
                    $existing->save();
                } else {
                    $modelClass::create(array_merge($keys, $changes));
                }

                return;
            } catch (Exception $e) {
                if ($attempt === $maxRetries) {
                    throw $e;
                }
                usleep(50000);
            }
        }
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

    public function getDashboardData(User $user, string $currency): array
    {
        $today = now()->toDateString();
        $startOfMonth = now()->startOfMonth()->toDateString();
        $startOfYear = now()->startOfYear()->toDateString();

        $daily = AnalyticsDaily::where('user_id', $user->id)
            ->where('date', $today)
            ->where('currency', $currency)
            ->first();

        $monthly = AnalyticsMonthly::where('user_id', $user->id)
            ->where('year', now()->year)
            ->where('month', now()->month)
            ->where('currency', $currency)
            ->first();

        $yearly = AnalyticsYearly::where('user_id', $user->id)
            ->where('year', now()->year)
            ->where('currency', $currency)
            ->first();

        $monthlyByAccount = AnalyticsAccountDaily::where('analytics_account_daily.user_id', $user->id)
            ->whereBetween('analytics_account_daily.date', [$startOfMonth, $today])
            ->where('analytics_account_daily.currency', $currency)
            ->join('accounts', 'analytics_account_daily.account_id', '=', 'accounts.id')
            ->select('accounts.name', 'accounts.color')
            ->selectRaw('SUM(analytics_account_daily.income) as income, SUM(analytics_account_daily.expense) as expense')
            ->groupBy('analytics_account_daily.account_id')
            ->get();

        $monthlyByCategory = AnalyticsCategoryDaily::where('analytics_category_daily.user_id', $user->id)
            ->whereBetween('analytics_category_daily.date', [$startOfMonth, $today])
            ->where('analytics_category_daily.currency', $currency)
            ->join('categories', 'analytics_category_daily.category_id', '=', 'categories.id')
            ->select('categories.name')
            ->selectRaw('SUM(analytics_category_daily.amount) as total')
            ->groupBy('analytics_category_daily.category_id')
            ->orderByDesc('total')
            ->get();

        $incomeTrend = AnalyticsDaily::where('user_id', $user->id)
            ->where('date', '>=', now()->subDays(30)->toDateString())
            ->where('currency', $currency)
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
