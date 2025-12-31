<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Services\OpenAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AIController extends Controller
{
    private OpenAIService $openaiService;

    public function __construct(OpenAIService $openaiService)
    {
        $this->openaiService = $openaiService;
    }

    public function handle(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string'],
        ]);

        $result = $this->openaiService->chatWithFunctions($request->input('prompt'));

        $function = $result['function'];
        $arguments = $result['arguments'];

        $user = $request->user();

        return match ($function) {
            'create_transaction' => $this->createTransaction($user, $arguments),
            'list_transactions' => $this->listTransactions($user, $arguments),
            'get_spending_summary' => $this->getSpendingSummary($user, $arguments),
            'get_category_breakdown' => $this->getCategoryBreakdown($user, $arguments),
            'get_account_breakdown' => $this->getAccountBreakdown($user, $arguments),
            'get_merchant_breakdown' => $this->getMerchantBreakdown($user, $arguments),
            'get_balance' => $this->getBalance($user),
            'chat' => $this->chatResponse($arguments['response'] ?? ''),
            default => response()->json(['error' => 'Unknown function: '.$function], 400),
        };
    }

    private function createTransaction($user, array $arguments): JsonResponse
    {
        $account = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => $arguments['account_name']],
            ['color' => '#3B82F6']
        );

        $category = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => $arguments['category_name']]
        );

        $merchant = null;
        if (! empty($arguments['merchant_name'])) {
            $merchant = Merchant::firstOrCreate(
                ['user_id' => $user->id, 'name' => $arguments['merchant_name']]
            );
        }

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'merchant_id' => $merchant?->id,
            'amount' => $arguments['amount'],
            'description' => $arguments['description'],
            'date' => $arguments['date'],
        ]);

        return response()->json([
            'type' => 'transaction_created',
            'message' => 'Transaction created successfully',
            'transaction' => $this->formatTransaction($transaction),
        ]);
    }

    private function listTransactions($user, array $arguments): JsonResponse
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
            $query->whereHas('category', function ($q) use ($arguments) {
                $q->where('name', 'like', '%'.$arguments['category_name'].'%');
            });
        }

        if (! empty($arguments['merchant_name'])) {
            $query->whereHas('merchant', function ($q) use ($arguments) {
                $q->where('name', 'like', '%'.$arguments['merchant_name'].'%');
            });
        }

        if (! empty($arguments['account_name'])) {
            $query->whereHas('account', function ($q) use ($arguments) {
                $q->where('name', 'like', '%'.$arguments['account_name'].'%');
            });
        }

        if (! empty($arguments['type'])) {
            if ($arguments['type'] === 'expense') {
                $query->where('amount', '<', 0);
            } elseif ($arguments['type'] === 'income') {
                $query->where('amount', '>=', 0);
            }
        }

        $limit = min((int) ($arguments['limit'] ?? 10), 50);
        $offset = (int) ($arguments['offset'] ?? 0);

        $transactions = $query->limit($limit)->offset($offset)->get();

        return response()->json([
            'type' => 'transactions_list',
            'count' => $transactions->count(),
            'transactions' => $transactions->map(fn ($t) => $this->formatTransaction($t)),
        ]);
    }

    private function getSpendingSummary($user, array $arguments): JsonResponse
    {
        $query = Transaction::where('user_id', $user->id);

        if (! empty($arguments['start_date'])) {
            $query->whereDate('date', '>=', $arguments['start_date']);
        }

        if (! empty($arguments['end_date'])) {
            $query->whereDate('date', '<=', $arguments['end_date']);
        }

        if (! empty($arguments['type']) && $arguments['type'] !== 'all') {
            if ($arguments['type'] === 'expense') {
                $query->where('amount', '<', 0);
            } elseif ($arguments['type'] === 'income') {
                $query->where('amount', '>=', 0);
            }
        }

        if (! empty($arguments['category_name'])) {
            $query->whereHas('category', function ($q) use ($arguments) {
                $q->where('name', 'like', '%'.$arguments['category_name'].'%');
            });
        }

        if (! empty($arguments['account_name'])) {
            $query->whereHas('account', function ($q) use ($arguments) {
                $q->where('name', 'like', '%'.$arguments['account_name'].'%');
            });
        }

        $totalIncome = (clone $query)->where('amount', '>=', 0)->sum('amount');
        $totalExpense = (clone $query)->where('amount', '<', 0)->sum('amount');
        $netAmount = (float) $totalIncome + (float) $totalExpense;

        $startDate = $arguments['start_date'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $arguments['end_date'] ?? now()->format('Y-m-d');

        return response()->json([
            'type' => 'spending_summary',
            'period' => ['start' => $startDate, 'end' => $endDate],
            'summary' => [
                'total_income' => (float) $totalIncome,
                'total_expense' => abs((float) $totalExpense),
                'net_amount' => (float) $netAmount,
            ],
        ]);
    }

    private function getCategoryBreakdown($user, array $arguments): JsonResponse
    {
        $query = Transaction::where('user_id', $user->id)
            ->where('amount', '<', 0)
            ->with('category');

        if (! empty($arguments['start_date'])) {
            $query->whereDate('date', '>=', $arguments['start_date']);
        }

        if (! empty($arguments['end_date'])) {
            $query->whereDate('date', '<=', $arguments['end_date']);
        }

        $type = $arguments['type'] ?? 'expense';
        if ($type === 'income') {
            $query->where('amount', '>=', 0);
        }

        $breakdown = $query
            ->select('category_id', DB::raw('SUM(ABS(amount)) as total'))
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get();

        $total = $breakdown->sum('total');

        return response()->json([
            'type' => 'category_breakdown',
            'total' => (float) $total,
            'breakdown' => $breakdown->map(fn ($item) => [
                'category' => $item->category->name ?? 'Uncategorized',
                'amount' => (float) $item->total,
                'percentage' => $total > 0 ? round(((float) $item->total / (float) $total) * 100, 1) : 0,
            ]),
        ]);
    }

    private function getAccountBreakdown($user, array $arguments): JsonResponse
    {
        $query = Transaction::where('user_id', $user->id)
            ->where('amount', '<', 0)
            ->with('account');

        if (! empty($arguments['start_date'])) {
            $query->whereDate('date', '>=', $arguments['start_date']);
        }

        if (! empty($arguments['end_date'])) {
            $query->whereDate('date', '<=', $arguments['end_date']);
        }

        $type = $arguments['type'] ?? 'expense';
        if ($type === 'income') {
            $query->where('amount', '>=', 0);
        }

        $breakdown = $query
            ->select('account_id', DB::raw('SUM(ABS(amount)) as total'))
            ->groupBy('account_id')
            ->orderByDesc('total')
            ->get();

        $total = $breakdown->sum('total');

        return response()->json([
            'type' => 'account_breakdown',
            'total' => (float) $total,
            'breakdown' => $breakdown->map(fn ($item) => [
                'account' => $item->account->name ?? 'Unknown',
                'amount' => (float) $item->total,
                'percentage' => $total > 0 ? round(((float) $item->total / (float) $total) * 100, 1) : 0,
            ]),
        ]);
    }

    private function getMerchantBreakdown($user, array $arguments): JsonResponse
    {
        $query = Transaction::where('user_id', $user->id)
            ->where('amount', '<', 0)
            ->with('merchant');

        if (! empty($arguments['start_date'])) {
            $query->whereDate('date', '>=', $arguments['start_date']);
        }

        if (! empty($arguments['end_date'])) {
            $query->whereDate('date', '<=', $arguments['end_date']);
        }

        if (! empty($arguments['merchant_name'])) {
            $query->whereHas('merchant', function ($q) use ($arguments) {
                $q->where('name', 'like', '%'.$arguments['merchant_name'].'%');
            });
        }

        $breakdown = $query
            ->select('merchant_id', DB::raw('SUM(ABS(amount)) as total'))
            ->groupBy('merchant_id')
            ->orderByDesc('total')
            ->get();

        $total = $breakdown->sum('total');

        return response()->json([
            'type' => 'merchant_breakdown',
            'total' => (float) $total,
            'breakdown' => $breakdown->map(fn ($item) => [
                'merchant' => $item->merchant->name ?? 'Unknown',
                'amount' => (float) $item->total,
                'percentage' => $total > 0 ? round(((float) $item->total / (float) $total) * 100, 1) : 0,
            ]),
        ]);
    }

    private function getBalance($user): JsonResponse
    {
        $accounts = Account::where('user_id', $user->id)->get();

        $totalBalance = $accounts->sum('balance');

        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('amount', '>=', 0)
            ->sum('amount');

        $totalExpense = Transaction::where('user_id', $user->id)
            ->where('amount', '<', 0)
            ->sum('amount');

        return response()->json([
            'type' => 'balance',
            'accounts' => $accounts->map(fn ($a) => [
                'name' => $a->name,
                'balance' => (float) $a->balance,
                'color' => $a->color,
            ]),
            'total_balance' => (float) $totalBalance,
            'total_income' => (float) $totalIncome,
            'total_expense' => abs((float) $totalExpense),
        ]);
    }

    private function chatResponse(string $message): JsonResponse
    {
        return response()->json([
            'type' => 'chat',
            'message' => $message,
        ]);
    }

    private function formatTransaction(Transaction $transaction): array
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
}
