<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Transaction;
use App\Services\AnalyticsService;

class TransactionObserver
{
    public function __construct(
        private AnalyticsService $analyticsService,
    ) {}

    public function created(Transaction $transaction): void
    {
        $this->analyticsService->applyTransaction($transaction);
    }

    public function updated(Transaction $transaction): void
    {
        $original = $transaction->getOriginal();

        $amountChanged = $transaction->amount !== ($original['amount'] ?? null);
        $dateChanged = $transaction->date !== ($original['date'] ?? null);

        if (! $amountChanged && ! $dateChanged) {
            return;
        }

        $oldTransaction = null;
        if ($amountChanged || $dateChanged) {
            $oldTransaction = new Transaction;
            $oldTransaction->user_id = $transaction->user_id;
            $oldTransaction->account_id = $original['account_id'];
            $oldTransaction->category_id = $original['category_id'];
            $oldTransaction->merchant_id = $original['merchant_id'];
            $oldTransaction->amount = $original['amount'];
            $oldTransaction->date = $original['date'];
            $oldTransaction->description = $original['description'];
        }

        $this->analyticsService->updateOnTransaction($transaction, $oldTransaction);
    }

    public function deleted(Transaction $transaction): void
    {
        $this->analyticsService->deleteTransaction($transaction);
    }

    public function restored(Transaction $transaction): void
    {
        $this->analyticsService->applyTransaction($transaction);
    }

    public function forceDeleted(Transaction $transaction): void
    {
        $this->analyticsService->deleteTransaction($transaction);
    }
}
