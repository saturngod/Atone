<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\OpenAIRequestException;
use App\Exceptions\OpenAIResponseException;
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

    public function parseTransactionPrompt(string $prompt): array
    {
        $payload = [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a financial transaction assistant. Extract transaction details from natural language and output ONLY valid JSON. Do not explain. Do not add markdown. Output format: {"account_name": "string", "category_name": "string", "amount": number, "description": "string", "merchant_name": "string|null", "date": "YYYY-MM-DD"}. Rules: - Use "Entertainment" for games, movies, streaming. - Use "Food & Dining" for restaurants, coffee, groceries. - Use "Income" for salary, deposits. - Amount negative for expenses, positive for income. - Date in YYYY-MM-DD format. Convert "yesterday" to actual date. - merchant_name: extract the store/merchant name if mentioned (e.g., "Starbucks", "Steam", "Apple"), otherwise null.',
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

        $requiredFields = ['account_name', 'category_name', 'amount', 'description', 'date'];
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

    public function chatWithFunctions(string $prompt, array $conversationHistory = []): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => 'You are a financial assistant that helps users manage their personal finances. Use the available functions to answer queries about transactions, spending, income, and balances. When providing numerical results, always format them clearly with currency symbols. '.
                'IMPORTANT: When creating transactions (create_transaction function), you MUST have ALL required information before calling the function: account_name, category_name, amount, description, and date. '.
                'If ANY of these fields are missing from the user\'s input, ask the user to provide the missing information. DO NOT make up or guess any values. '.
                'Be conversational and friendly when asking for missing details. For example: "How much was the coffee?" or "What date was this purchase?" or "Which account should I use?"',
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
                    'CRITICAL: Only call this function when you have ALL required information from the user. '.
                    'If the user provides incomplete information (missing amount, date, account, category, or description), ask them for the missing details first. '.
                    'DO NOT make up or guess any values. The user must provide all information.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'account_name' => [
                            'type' => 'string',
                            'description' => 'The name of the account used for the transaction. Ask if user does not specify.',
                        ],
                        'category_name' => [
                            'type' => 'string',
                            'description' => 'The name of the category for the transaction. Ask if user does not specify.',
                        ],
                        'amount' => [
                            'type' => 'number',
                            'description' => 'The transaction amount (positive for income, negative for expense). Ask if user does not specify.',
                        ],
                        'description' => [
                            'type' => 'string',
                            'description' => 'A brief description of the transaction. Use the user\'s description if provided.',
                        ],
                        'merchant_name' => [
                            'type' => ['string', 'null'],
                            'description' => 'The name of the merchant/store (e.g., "Starbucks", "Steam", "Apple"). Extract from prompt if mentioned, otherwise null',
                        ],
                        'date' => [
                            'type' => 'string',
                            'description' => 'The date of the transaction in YYYY-MM-DD format. Use today\'s date if not specified by user.',
                        ],
                    ],
                    'required' => ['account_name', 'category_name', 'amount', 'description', 'date'],
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
                'description' => 'Get total spending or income summary for a time period. Use for queries like "how much did I spend this month", "total income this week", etc.',
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
