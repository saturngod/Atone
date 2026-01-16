<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TransactionService
{
    public function getTransactionsForUser(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = $user->transactions()
            ->with(['account', 'category', 'merchant']);

        $this->applyFilters($query, $filters);

        return $query->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 50)
            ->withQueryString();
    }

    public function getTransactionSummary(User $user, array $filters = []): array
    {
        $query = $user->transactions();

        $this->applyFilters($query, $filters);

        $totalIncome = (float) (clone $query)->where('amount', '>=', 0)->sum('amount');
        $totalExpense = (float) (clone $query)->where('amount', '<', 0)->sum('amount');
        $count = $query->count();

        return [
            'total_income' => $totalIncome,
            'total_expense' => abs($totalExpense),
            'total_count' => $count,
        ];
    }

    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('merchant', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('account', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if (! empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        if (! empty($filters['account_id']) && $filters['account_id'] !== 'all') {
            $query->where('account_id', $filters['account_id']);
        }

        if (! empty($filters['category_id']) && $filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['merchant_id']) && $filters['merchant_id'] !== 'all') {
            $query->where('merchant_id', $filters['merchant_id']);
        }
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
