<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class TransactionQueryService
{
    public function createTransactionFromAI(User $user, array $arguments): Transaction
    {
        $account = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => $arguments['account_name']],
            ['color' => '#3B82F6']
        );

        $category = null;
        if (! empty($arguments['category_name'])) {
            $category = Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => $arguments['category_name']]
            );
        }

        $merchant = null;
        if (! empty($arguments['merchant_name'])) {
            $merchant = Merchant::firstOrCreate(
                ['user_id' => $user->id, 'name' => $arguments['merchant_name']]
            );
        }

        return Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category?->id,
            'merchant_id' => $merchant?->id,
            'amount' => $arguments['amount'],
            'description' => $arguments['description'],
            'date' => $arguments['date'],
        ]);
    }

    public function listTransactions(User $user, array $arguments): array
    {
        $query = $this->buildTransactionQuery($user, $arguments);

        $limit = min((int) ($arguments['limit'] ?? 10), 50);
        $offset = (int) ($arguments['offset'] ?? 0);

        $transactions = $query->limit($limit)->offset($offset)->get();

        return [
            'count' => $transactions->count(),
            'transactions' => $transactions->map(fn ($t) => $this->formatTransaction($t)),
        ];
    }

    public function getSpendingSummary(User $user, array $arguments): array
    {
        $query = $this->buildTransactionQuery($user, $arguments);

        $totalIncome = (clone $query)->where('amount', '>=', 0)->sum('amount');
        $totalExpense = (clone $query)->where('amount', '<', 0)->sum('amount');
        $netAmount = (float) $totalIncome + (float) $totalExpense;

        $startDate = $arguments['start_date'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $arguments['end_date'] ?? now()->format('Y-m-d');

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'summary' => [
                'total_income' => (float) $totalIncome,
                'total_expense' => abs((float) $totalExpense),
                'net_amount' => $netAmount,
            ],
        ];
    }

    public function getCategoryBreakdown(User $user, array $arguments): array
    {
        $query = $this->buildTransactionQuery($user, $arguments);

        $type = $arguments['type'] ?? 'expense';
        if ($type === 'income') {
            $query->where('amount', '>=', 0);
        } else {
            $query->where('amount', '<', 0);
        }

        $query->with('category');

        $breakdown = $query
            ->select('category_id', DB::raw('SUM(ABS(amount)) as total'))
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get();

        $total = $breakdown->sum('total');

        return [
            'total' => (float) $total,
            'breakdown' => $breakdown->map(fn ($item) => [
                'category' => $item->category->name ?? 'Uncategorized',
                'amount' => (float) $item->total,
                'percentage' => $total > 0 ? round(((float) $item->total / (float) $total) * 100, 1) : 0,
            ]),
        ];
    }

    public function getAccountBreakdown(User $user, array $arguments): array
    {
        $query = $this->buildTransactionQuery($user, $arguments);

        $type = $arguments['type'] ?? 'expense';
        if ($type === 'income') {
            $query->where('amount', '>=', 0);
        } else {
            $query->where('amount', '<', 0);
        }

        $query->with('account');

        $breakdown = $query
            ->select('account_id', DB::raw('SUM(ABS(amount)) as total'))
            ->groupBy('account_id')
            ->orderByDesc('total')
            ->get();

        $total = $breakdown->sum('total');

        return [
            'total' => (float) $total,
            'breakdown' => $breakdown->map(fn ($item) => [
                'account' => $item->account->name ?? 'Unknown',
                'amount' => (float) $item->total,
                'percentage' => $total > 0 ? round(((float) $item->total / (float) $total) * 100, 1) : 0,
            ]),
        ];
    }

    public function getMerchantBreakdown(User $user, array $arguments): array
    {
        $query = $this->buildTransactionQuery($user, $arguments);
        $query->where('amount', '<', 0)->with('merchant');

        $breakdown = $query
            ->select('merchant_id', DB::raw('SUM(ABS(amount)) as total'))
            ->groupBy('merchant_id')
            ->orderByDesc('total')
            ->get();

        $total = $breakdown->sum('total');

        return [
            'total' => (float) $total,
            'breakdown' => $breakdown->map(fn ($item) => [
                'merchant' => $item->merchant->name ?? 'Unknown',
                'amount' => (float) $item->total,
                'percentage' => $total > 0 ? round(((float) $item->total / (float) $total) * 100, 1) : 0,
            ]),
        ];
    }

    public function getBalance(User $user): array
    {
        $accounts = Account::where('user_id', $user->id)->get();

        $totalBalance = $accounts->sum('balance');

        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('amount', '>=', 0)
            ->sum('amount');

        $totalExpense = Transaction::where('user_id', $user->id)
            ->where('amount', '<', 0)
            ->sum('amount');

        return [
            'accounts' => $accounts->map(fn ($a) => [
                'name' => $a->name,
                'balance' => (float) $a->balance,
                'color' => $a->color,
            ]),
            'total_balance' => (float) $totalBalance,
            'total_income' => (float) $totalIncome,
            'total_expense' => abs((float) $totalExpense),
        ];
    }

    public function formatTransaction(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'amount' => (float) $transaction->amount,
            'description' => $transaction->description,
            'date' => $transaction->date,
            'account' => $transaction->account ? [
                'id' => $transaction->account->id,
                'name' => $transaction->account->name,
                'color' => $transaction->account->color,
            ] : null,
            'category' => $transaction->category ? [
                'id' => $transaction->category->id,
                'name' => $transaction->category->name,
            ] : null,
            'merchant' => $transaction->merchant ? [
                'id' => $transaction->merchant->id,
                'name' => $transaction->merchant->name,
            ] : null,
        ];
    }

    private function buildTransactionQuery(User $user, array $arguments): Builder
    {
        $query = Transaction::where('user_id', $user->id)
            ->with(['account', 'category'])
            ->orderBy('date', 'desc');

        if (! empty($arguments['start_date'])) {
            $query->whereDate('date', '>=', $arguments['start_date']);
        }

        if (! empty($arguments['end_date'])) {
            $query->whereDate('date', '<=', $arguments['end_date']);
        }

        if (! empty($arguments['category_name'])) {
            $query->whereHas('category', fn ($q) => $q->where('name', 'like', '%'.$arguments['category_name'].'%'));
        }

        if (! empty($arguments['merchant_name'])) {
            $query->whereHas('merchant', fn ($q) => $q->where('name', 'like', '%'.$arguments['merchant_name'].'%'));
        }

        if (! empty($arguments['account_name'])) {
            $query->whereHas('account', fn ($q) => $q->where('name', 'like', '%'.$arguments['account_name'].'%'));
        }

        if (! empty($arguments['type'])) {
            if ($arguments['type'] === 'expense') {
                $query->where('amount', '<', 0);
            } elseif ($arguments['type'] === 'income') {
                $query->where('amount', '>=', 0);
            }
        }

        return $query;
    }
}
