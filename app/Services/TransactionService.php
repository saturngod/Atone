<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TransactionService
{
    public function getTransactionsForUser(User $user): Collection
    {
        return $user->transactions()
            ->with(['account', 'category', 'merchant'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getRecentTransactions(User $user, string $currency, int $limit = 5): Collection
    {
        return $user->transactions()
            ->whereHas('account', fn ($query) => $query->where('currency_code', $currency))
            ->with(['account', 'category', 'merchant'])
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

        $merchantId = null;
        if (! empty($data['merchant_name'])) {
            $merchant = $user->merchants()->firstOrCreate(['name' => $data['merchant_name']]);
            $merchantId = $merchant->id;
        }

        return $user->transactions()->create([
            'account_id' => (int) $data['account_id'],
            'category_id' => $categoryId,
            'merchant_id' => $merchantId,
            'amount' => (float) $data['amount'],
            'description' => $data['description'],
            'date' => $data['date'],
        ]);
    }

    public function updateTransaction(Transaction $transaction, array $data): bool
    {
        $merchantId = null;
        if (! empty($data['merchant_name'])) {
            $merchant = Merchant::firstOrCreate(
                ['user_id' => $transaction->user_id, 'name' => $data['merchant_name']]
            );
            $merchantId = $merchant->id;
        }

        return $transaction->update([
            'account_id' => (int) $data['account_id'],
            'category_id' => ! empty($data['category_id']) ? (int) $data['category_id'] : null,
            'merchant_id' => $merchantId,
            'amount' => (float) $data['amount'],
            'description' => $data['description'],
            'date' => $data['date'],
        ]);
    }

    public function deleteTransaction(Transaction $transaction): bool
    {
        return $transaction->delete();
    }

    public function getTotalBalance(User $user, string $currency): float
    {
        return (float) $user->accounts()
            ->where('currency_code', $currency)
            ->withSum('transactions', 'amount')
            ->get()
            ->sum(fn ($account) => $account->transactions_sum_amount ?? 0);
    }
}
