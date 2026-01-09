<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\OpenAIRequestException;
use App\Exceptions\OpenAIResponseException;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    private string $model;

    private string $apiKey;

    private string $url;

    public function __construct()
    {
        $this->model = config('openai.model');
        $this->apiKey = config('openai.api_key');
        $this->url = config('openai.url');
    }

    public function parseTransactionPrompt(User $user, string $prompt): array
    {
        $accounts = $user->accounts()->get(['name', 'currency_code']);
        $accountContext = $accounts->map(fn ($account) => "- {$account->name} ({$account->currency_code})")->join("\n");

        if ($accountContext) {
            $accountContext = "User has these accounts:\n$accountContext\nIf account is mentioned, use its currency logic.";
        }

        $userContext = $this->getUserContext($user);

        $payload = [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a financial transaction assistant. Extract transaction details from natural language and output ONLY valid JSON. Output format: {"account_name": "string", "category_name": "string", "amount": number, "description": "string", "merchant_name": "string|null", "date": "YYYY-MM-DD", "currency": "string|null"}. Rules: - Use "Entertainment" for games, movies, streaming. - Use "Food & Dining" for restaurants, coffee, groceries. - Use "Income" for salary, deposits. - Amount negative for expenses, positive for income. - Date in YYYY-MM-DD format. - merchant_name: extract if mentioned, else null. - currency: Extract explicit currency code (e.g. USD, MMK) if mentioned (e.g. "500 MMK"), otherwise null. '.$accountContext.' '.$userContext,
                ],
                ['role' => 'user', 'content' => $prompt],
            ],
        ];

        $response = $this->request('POST', '/chat/completions', $payload);

        Log::debug('OpenAI API Response', ['response' => $response]);

        $content = $response['choices'][0]['message']['content'] ?? '';

        $jsonStart = strpos($content, '{');
        $jsonEnd = strrpos($content, '}');

        if ($jsonStart === false || $jsonEnd === false || $jsonEnd <= $jsonStart) {
            throw new OpenAIResponseException('No valid JSON found in AI response: '.$content);
        }

        $jsonString = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
        $result = json_decode($jsonString, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new OpenAIResponseException('Failed to decode JSON: '.json_last_error_msg());
        }

        $requiredFields = ['account_name', 'category_name', 'amount', 'description', 'date', 'currency'];
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (! isset($result[$field])) {
                $missingFields[] = $field;
            }
        }

        if (! empty($missingFields)) {
            throw new OpenAIResponseException('Missing required fields from OpenAI: '.implode(', ', $missingFields));
        }

        return $result;
    }

    public function chatWithFunctions(User $user, string $prompt, array $conversationHistory = []): array
    {
        $userContext = $this->getUserContext($user);

        // Build context about user's existing data
        $accounts = $user->accounts()->get(['name', 'currency_code']);
        $accountContext = $accounts->map(fn ($a) => "{$a->name} ({$a->currency_code})")->join(', ');

        $categories = $user->categories()->pluck('name')->join(', ');
        $merchants = $user->merchants()->pluck('name')->take(20)->join(', ');

        $dataContext = '';
        if ($accountContext) {
            $dataContext .= "User's accounts: {$accountContext}. ";
        }
        if ($categories) {
            $dataContext .= "User's categories: {$categories}. Use these exact category names when possible. ";
        }
        if ($merchants) {
            $dataContext .= "User's existing merchants: {$merchants}. Reuse these names when the user mentions them. ";
        }

        $messages = [
            [
                'role' => 'system',
                'content' => 'You are a financial assistant that helps users manage their personal finances. Use the available functions to answer queries about transactions, spending, income, and balances. When providing numerical results, always format them clearly with currency symbols. '.
                $dataContext.
                'IMPORTANT: When creating transactions (create_transaction function), you MUST have ALL 6 required fields before calling the function: '.
                '1. account_name - Which account to use. If user has only ONE account, use it automatically. If multiple, ask which one. '.
                '2. amount - The transaction amount (negative for expenses, positive for income) '.
                '3. description - Brief description of what the transaction is for '.
                '4. date - The date of the transaction (use today if user says "today" or doesn\'t specify) '.
                '5. category_name - REQUIRED. Auto-detect from context: "coffee/restaurant/groceries" -> "Food & Dining", "games/Netflix/movies/Steam" -> "Entertainment", "gas/Uber/taxi" -> "Transportation", "salary/paycheck/deposit" -> "Income", "electricity/water/internet" -> "Utilities", "rent/mortgage" -> "Housing", "doctor/pharmacy/medicine" -> "Healthcare", "shopping/clothes/Amazon" -> "Shopping". If you cannot detect the category, ASK the user. '.
                '6. merchant_name - REQUIRED. Extract from the user\'s message (e.g., "Starbucks", "Amazon", "Steam", "Netflix", "Uber"). If the user mentions a store, company, or brand name, use it. If no merchant is mentioned and you cannot infer one, ASK the user: "Where did you make this purchase?" or "What\'s the name of the merchant/store?" '.
                'DO NOT call create_transaction unless you have values for ALL 6 fields. If ANY field is missing and cannot be auto-detected, ask the user in a friendly, conversational way. '.
                'Examples of asking: "What category would you like for this transaction?" or "Which store/merchant was this at?" or "How much did you spend?" '.$userContext,
            ],
            ...$conversationHistory,
            ['role' => 'user', 'content' => $prompt],
        ];

        $payload = [
            'model' => $this->model,
            'messages' => $messages,
            'tools' => $this->getFunctionSchemas(),
            'tool_choice' => 'auto',
        ];

        $response = $this->request('POST', '/chat/completions', $payload);

        Log::debug('OpenAI Function Calling Response', ['response' => $response]);

        $message = $response['choices'][0]['message'] ?? [];

        if (isset($message['tool_calls']) && ! empty($message['tool_calls'])) {
            $toolCall = $message['tool_calls'][0];
            $functionName = $toolCall['function']['name'] ?? '';
            $arguments = json_decode($toolCall['function']['arguments'] ?? '{}', true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new OpenAIResponseException('Failed to decode function arguments: '.json_last_error_msg());
            }

            return [
                'function' => $functionName,
                'arguments' => $arguments,
                'assistant_message' => [
                    'role' => 'assistant',
                    'content' => $message['content'] ?? '',
                    'tool_calls' => $message['tool_calls'],
                ],
            ];
        }

        $assistantMessage = [
            'role' => 'assistant',
            'content' => $message['content'] ?? '',
        ];

        return [
            'function' => 'chat',
            'arguments' => ['response' => $message['content'] ?? ''],
            'assistant_message' => $assistantMessage,
        ];
    }

    private function getUserContext(User $user): string
    {
        $timezone = $user->timezone ?? 'UTC';
        $currencyCode = $user->currency_code ?? 'USD';
        $now = now($timezone);

        return sprintf(
            'Current Date: %s. Current Time: %s. User Timezone: %s. User Default Currency: %s. '.
            'When the user mentions amounts without a currency symbol (e.g., "50" instead of "$50"), assume they mean %s.',
            $now->format('Y-m-d'),
            $now->format('H:i:s'),
            $timezone,
            $currencyCode,
            $currencyCode
        );
    }

    private function getFunctionSchemas(): array
    {
        return [
            $this->createTransactionSchema(),
            $this->listTransactionsSchema(),
            $this->getSpendingSummarySchema(),
            $this->getCategoryBreakdownSchema(),
            $this->getAccountBreakdownSchema(),
            $this->getMerchantBreakdownSchema(),
            $this->getBalanceSchema(),
        ];
    }

    private function createTransactionSchema(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'create_transaction',
                'description' => 'Create a new transaction from natural language description. Use this when the user wants to add a new expense or income entry. '.
                    'CRITICAL: Only call this function when you have ALL 6 required fields. '.
                    'The 6 required fields are: account_name, amount, description, date, category_name, and merchant_name. '.
                    'If ANY field is missing and cannot be auto-detected from context, you MUST ask the user for it before calling this function. '.
                    'DO NOT make up or guess values. Auto-detect category and merchant from context when possible.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'account_name' => [
                            'type' => 'string',
                            'description' => 'The name of the account used for the transaction. REQUIRED. Ask the user if not specified.',
                        ],
                        'category_name' => [
                            'type' => 'string',
                            'description' => 'The category for the transaction. REQUIRED. Auto-detect based on context: "coffee/restaurant/groceries" -> "Food & Dining", "games/Netflix/movies/Steam" -> "Entertainment", "gas/Uber/taxi" -> "Transportation", "salary/paycheck" -> "Income", "utilities/electricity/water" -> "Utilities", "rent/mortgage" -> "Housing", "doctor/pharmacy" -> "Healthcare", "shopping/clothes" -> "Shopping". If you cannot detect it, ASK the user.',
                        ],
                        'amount' => [
                            'type' => 'number',
                            'description' => 'The transaction amount. REQUIRED. Positive for income, negative for expense. Ask the user if not specified.',
                        ],
                        'description' => [
                            'type' => 'string',
                            'description' => 'A brief description of the transaction. REQUIRED. Use the user\'s description or generate a concise one.',
                        ],
                        'merchant_name' => [
                            'type' => 'string',
                            'description' => 'The name of the merchant/store/company. REQUIRED. Extract from the user\'s message (e.g., "Starbucks", "Steam", "Amazon", "Netflix", "Uber", "Walmart"). If no merchant is mentioned, ASK the user: "Where did you make this purchase?" or "What\'s the name of the store/merchant?"',
                        ],
                        'date' => [
                            'type' => 'string',
                            'description' => 'The date of the transaction in YYYY-MM-DD format. REQUIRED. Use today\'s date if not specified by user or if user says "today".',
                        ],
                    ],
                    'required' => ['account_name', 'category_name', 'amount', 'description', 'merchant_name', 'date'],
                ],
            ],
        ];
    }

    private function listTransactionsSchema(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'list_transactions',
                'description' => 'List transactions with optional filters. Use this for queries like "show me transactions", "what did I spend this month", "transactions last week", etc.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => $this->nullableString('Start date in YYYY-MM-DD format. Use for date range queries. If not provided, defaults to beginning of current month.'),
                        'end_date' => $this->nullableString('End date in YYYY-MM-DD format. Use for date range queries. If not provided, defaults to today.'),
                        'category_name' => $this->nullableString('Filter by category name. E.g., "Entertainment", "Food & Dining", "Transportation"'),
                        'merchant_name' => $this->nullableString('Filter by merchant name. E.g., "Starbucks", "Steam", "Apple"'),
                        'account_name' => $this->nullableString('Filter by account name. E.g., "Apple Card", "Bank Account"'),
                        'type' => [
                            'type' => 'string',
                            'description' => 'Filter by transaction type: "expense" for spending, "income" for earnings',
                            'enum' => ['expense', 'income'],
                            'nullable' => true,
                        ],
                        'limit' => [
                            'type' => 'integer',
                            'description' => 'Maximum number of transactions to return (default: 10, max: 50)',
                            'nullable' => true,
                        ],
                        'offset' => [
                            'type' => 'integer',
                            'description' => 'Number of transactions to skip for pagination',
                            'nullable' => true,
                        ],
                    ],
                    'required' => [],
                ],
            ],
        ];
    }

    private function getSpendingSummarySchema(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'get_spending_summary',
                'description' => 'Get total spending or income summary for a time period. Use for queries like "how much did I spend this month", "total income this week", "how much did I spend at Starbucks", etc.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => $this->nullableString('Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.'),
                        'end_date' => $this->nullableString('End date in YYYY-MM-DD format. If not provided, defaults to today.'),
                        'type' => [
                            'type' => 'string',
                            'description' => 'Type of summary: "expense" for spending, "income" for earnings, "all" for both',
                            'enum' => ['expense', 'income', 'all'],
                            'nullable' => true,
                        ],
                        'category_name' => $this->nullableString('Optional category filter. If provided, returns spending only for that category.'),
                        'account_name' => $this->nullableString('Optional account filter. If provided, returns spending only for that account.'),
                        'merchant_name' => $this->nullableString('Optional merchant filter. If provided, returns spending only for that merchant. E.g., "Starbucks", "Steam", "Apple".'),
                    ],
                    'required' => [],
                ],
            ],
        ];
    }

    private function getCategoryBreakdownSchema(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'get_category_breakdown',
                'description' => 'Get spending breakdown by category. Use for queries like "what categories did I spend on most", "spending by category this month", etc.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => $this->nullableString('Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.'),
                        'end_date' => $this->nullableString('End date in YYYY-MM-DD format. If not provided, defaults to today.'),
                        'type' => [
                            'type' => 'string',
                            'description' => 'Type of spending: "expense", "income", or "all"',
                            'enum' => ['expense', 'income', 'all'],
                            'nullable' => true,
                        ],
                    ],
                    'required' => [],
                ],
            ],
        ];
    }

    private function getAccountBreakdownSchema(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'get_account_breakdown',
                'description' => 'Get spending breakdown by account. Use for queries like "how much did I spend from each account", "account spending this month", etc.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => $this->nullableString('Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.'),
                        'end_date' => $this->nullableString('End date in YYYY-MM-DD format. If not provided, defaults to today.'),
                        'type' => [
                            'type' => 'string',
                            'description' => 'Type of spending: "expense", "income", or "all"',
                            'enum' => ['expense', 'income', 'all'],
                            'nullable' => true,
                        ],
                    ],
                    'required' => [],
                ],
            ],
        ];
    }

    private function getMerchantBreakdownSchema(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'get_merchant_breakdown',
                'description' => 'Get spending breakdown by merchant. Use for queries like "what merchants did I spend at most", "spending by merchant this month", "how much did I spend at Starbucks", etc.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => $this->nullableString('Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.'),
                        'end_date' => $this->nullableString('End date in YYYY-MM-DD format. If not provided, defaults to today.'),
                        'merchant_name' => $this->nullableString('Filter to a specific merchant. E.g., "Starbucks", "Steam"'),
                    ],
                    'required' => [],
                ],
            ],
        ];
    }

    private function getBalanceSchema(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'get_balance',
                'description' => 'Get current total balance across all accounts. Use for queries like "what is my total balance", "how much money do I have", etc. Returns total balance, total income, and total expenses.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [],
                    'required' => [],
                ],
            ],
        ];
    }

    private function nullableString(string $description): array
    {
        return [
            'type' => 'string',
            'description' => $description,
            'nullable' => true,
        ];
    }

    private function request(string $method, string $endpoint, array $payload): array
    {
        $url = rtrim($this->url, '/').$endpoint;

        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer '.$this->apiKey,
            ],
            CURLOPT_TIMEOUT => 30,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new OpenAIRequestException('cURL error: '.$error);
        }

        if ($httpCode >= 400) {
            throw new OpenAIRequestException('OpenAI API error: HTTP '.$httpCode.' - '.$response);
        }

        $result = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new OpenAIResponseException('Failed to decode API response: '.json_last_error_msg());
        }

        return $result;
    }
}
