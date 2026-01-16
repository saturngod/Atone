<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\TransactionStoreRequest;
use App\Http\Requests\TransactionUpdateRequest;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private TransactionService $transactionService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $filters = $request->only([
            'search',
            'date_from',
            'date_to',
            'account_id',
            'category_id',
            'merchant_id',
        ]);

        $transactions = $this->transactionService->getTransactionsForUser($user, $filters);

        return Inertia::render('Transactions/Index', [
            'transactions' => [
                'data' => $transactions->items(),
                'links' => $transactions->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $transactions->currentPage(),
                    'last_page' => $transactions->lastPage(),
                    'from' => $transactions->firstItem(),
                    'to' => $transactions->lastItem(),
                    'total' => $transactions->total(),
                ],
            ],
            'summary' => $this->transactionService->getTransactionSummary($user, $filters),
            'filters' => $filters,
            'accounts' => $user->accounts()
                ->select('id', 'name', 'color')
                ->get()
                ->map(fn ($account) => [
                    'id' => $account->id,
                    'name' => $account->name,
                    'color' => $account->color,
                ]),
            'categories' => $user->categories()
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]),
            'merchants' => $user->merchants()
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
                ->map(fn ($merchant) => [
                    'id' => $merchant->id,
                    'name' => $merchant->name,
                ]),
        ]);
    }

    public function store(TransactionStoreRequest $request)
    {
        $this->transactionService->createTransaction($request->user(), $request->validated());

        return back()->with('success', 'Transaction added.');
    }

    public function update(TransactionUpdateRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        $this->transactionService->updateTransaction($transaction, $request->validated());

        return back()->with('success', 'Transaction updated.');
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $this->transactionService->deleteTransaction($transaction);

        return back()->with('success', 'Transaction deleted.');
    }
}
