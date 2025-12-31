<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\TransactionStoreRequest;
use App\Http\Requests\TransactionUpdateRequest;
use App\Models\Transaction;
use App\Services\AnalyticsService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private AnalyticsService $analyticsService,
    ) {}

    public function index(Request $request)
    {
        $transactions = $request
            ->user()
            ->transactions()
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $accounts = $request
            ->user()
            ->accounts()
            ->select('id', 'name', 'color')
            ->get()
            ->map(fn ($account) => [
                'id' => $account->id,
                'name' => $account->name,
                'color' => $account->color,
            ]);

        $categories = $request
            ->user()
            ->categories()
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]);

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    public function store(TransactionStoreRequest $request)
    {
        $categoryId = null;

        if (empty($request->category_id) && $request->category_name) {
            $category = $request
                ->user()
                ->categories()
                ->firstOrCreate(['name' => $request->category_name]);
            $categoryId = $category->id;
        } elseif ($request->category_id) {
            $categoryId = (int) $request->category_id;
        }

        $transaction = $request->user()->transactions()->create([
            'account_id' => (int) $request->account_id,
            'category_id' => $categoryId,
            'amount' => (float) $request->amount,
            'description' => $request->description,
            'date' => $request->date,
        ]);

        $this->analyticsService->updateOnTransaction($transaction);

        return back()->with('success', 'Transaction added.');
    }

    public function update(
        TransactionUpdateRequest $request,
        Transaction $transaction,
    ) {
        $this->authorize('update', $transaction);

        $oldTransaction = clone $transaction;

        $transaction->update([
            'account_id' => (int) $request->account_id,
            'category_id' => $request->category_id ? (int) $request->category_id : null,
            'amount' => (float) $request->amount,
            'description' => $request->description,
            'date' => $request->date,
        ]);

        $this->analyticsService->updateOnTransaction($transaction, $oldTransaction);

        return back()->with('success', 'Transaction updated.');
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);

        $this->analyticsService->deleteTransaction($transaction);

        $transaction->delete();

        return back()->with('success', 'Transaction deleted.');
    }
}
