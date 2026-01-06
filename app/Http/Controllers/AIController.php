<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\OpenAIService;
use App\Services\TransactionQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AIController extends Controller
{
    public function __construct(
        private OpenAIService $openaiService,
        private TransactionQueryService $transactionQueryService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('AI/Index');
    }

    public function handle(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string'],
            'messages' => ['array', 'nullable'],
            'messages.*.role' => ['required', 'in:system,user,assistant,tool'],
            'messages.*.content' => ['nullable', 'string'],
            'messages.*.tool_calls' => ['array', 'nullable'],
        ]);

        $conversationHistory = $request->input('messages', []);
        $prompt = $request->input('prompt');

        $user = $request->user();
        $result = $this->openaiService->chatWithFunctions($user, $prompt, $conversationHistory);

        $function = $result['function'];
        $arguments = $result['arguments'];
        $assistantMessage = $result['assistant_message'] ?? null;

        $user = $request->user();

        $response = match ($function) {
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

        // Add the assistant's message to the response for frontend to store
        if ($assistantMessage && $response->status() === 200) {
            $data = $response->getData(true);
            $data['assistant_message'] = $assistantMessage;
            $response->setData($data);
        }

        return $response;
    }

    private function createTransaction($user, array $arguments): JsonResponse
    {
        $transaction = $this->transactionQueryService->createTransactionFromAI($user, $arguments);

        return response()->json([
            'type' => 'transaction_created',
            'message' => 'Transaction created successfully',
            'transaction' => $this->transactionQueryService->formatTransaction($transaction),
        ]);
    }

    private function listTransactions($user, array $arguments): JsonResponse
    {
        $result = $this->transactionQueryService->listTransactions($user, $arguments);

        return response()->json([
            'type' => 'transactions_list',
            'count' => $result['count'],
            'transactions' => $result['transactions'],
        ]);
    }

    private function getSpendingSummary($user, array $arguments): JsonResponse
    {
        $result = $this->transactionQueryService->getSpendingSummary($user, $arguments);

        return response()->json([
            'type' => 'spending_summary',
            'period' => $result['period'],
            'summary' => $result['summary'],
        ]);
    }

    private function getCategoryBreakdown($user, array $arguments): JsonResponse
    {
        $result = $this->transactionQueryService->getCategoryBreakdown($user, $arguments);

        return response()->json([
            'type' => 'category_breakdown',
            'total' => $result['total'],
            'breakdown' => $result['breakdown'],
        ]);
    }

    private function getAccountBreakdown($user, array $arguments): JsonResponse
    {
        $result = $this->transactionQueryService->getAccountBreakdown($user, $arguments);

        return response()->json([
            'type' => 'account_breakdown',
            'total' => $result['total'],
            'breakdown' => $result['breakdown'],
        ]);
    }

    private function getMerchantBreakdown($user, array $arguments): JsonResponse
    {
        $result = $this->transactionQueryService->getMerchantBreakdown($user, $arguments);

        return response()->json([
            'type' => 'merchant_breakdown',
            'total' => $result['total'],
            'breakdown' => $result['breakdown'],
        ]);
    }

    private function getBalance($user): JsonResponse
    {
        $result = $this->transactionQueryService->getBalance($user);

        return response()->json([
            'type' => 'balance',
            'accounts' => $result['accounts'],
            'total_balance' => $result['total_balance'],
            'total_income' => $result['total_income'],
            'total_expense' => $result['total_expense'],
        ]);
    }

    private function chatResponse(string $message): JsonResponse
    {
        return response()->json([
            'type' => 'chat',
            'message' => $message,
        ]);
    }
}
