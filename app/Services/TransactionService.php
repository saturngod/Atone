<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TransactionService
{
    public function getTransactionsForUser(User $user): Collection
    {
        return $user->transactions()
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getRecentTransactions(User $user, int $limit = 5): Collection
    {
        return $user->transactions()
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    public function createTransaction(User $user, array $data): Transaction
    {
        $categoryId = null;

        if (empty($data['category_id']) && ! empty($data['category_name'])) {
            $category = $user->categories()->firstOrCreate(['name' => $data['category_name']]);
            $categoryId = $category->id;
        } elseif (! empty($data['category_id'])) {
            $categoryId = (int) $data['category_id'];
        }

        return $user->transactions()->create([
            'account_id' => (int) $data['account_id'],
            'category_id' => $categoryId,
            'amount' => (float) $data['amount'],
            'description' => $data['description'],
            'date' => $data['date'],
        ]);
    }

    public function updateTransaction(Transaction $transaction, array $data): bool
    {
        return $transaction->update([
            'account_id' => (int) $data['account_id'],
            'category_id' => ! empty($data['category_id']) ? (int) $data['category_id'] : null,
            'amount' => (float) $data['amount'],
            'description' => $data['description'],
            'date' => $data['date'],
        ]);
    }

    public function deleteTransaction(Transaction $transaction): bool
    {
        return $transaction->delete();
    }

    public function getTotalBalance(User $user): float
    {
        return (float) $user->accounts()
            ->withSum('transactions', 'amount')
            ->get()
            ->sum(fn ($account) => $account->transactions_sum_amount ?? 0);
    }
}
