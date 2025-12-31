<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
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

    public function chat(string $message): string
    {
        $payload = [
            'model' => $this->model,
            'messages' => [
                ['role' => 'user', 'content' => $message],
            ],
        ];

        $response = $this->request('POST', '/chat/completions', $payload);

        return $response['choices'][0]['message']['content'];
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

        if ($jsonStart !== false && $jsonEnd !== false && $jsonEnd > $jsonStart) {
            $jsonString = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
            $result = json_decode($jsonString, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $requiredFields = ['account_name', 'category_name', 'amount', 'description', 'date'];
                $missingFields = [];

                foreach ($requiredFields as $field) {
                    if (! isset($result[$field])) {
                        $missingFields[] = $field;
                    }
                }

                if (empty($missingFields)) {
                    return $result;
                }

                throw new Exception('Missing required fields from OpenAI: '.implode(', ', $missingFields));
            }
        }

        throw new Exception('Failed to parse transaction from AI response: '.$content);
    }

    public function chatWithFunctions(string $prompt): array
    {
        $payload = [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a financial assistant that helps users manage their personal finances. Use the available functions to answer queries about transactions, spending, income, and balances. When providing numerical results, always format them clearly with currency symbols.',
                ],
                ['role' => 'user', 'content' => $prompt],
            ],
            'tools' => [
                [
                    'type' => 'function',
                    'function' => [
                        'name' => 'create_transaction',
                        'description' => 'Create a new transaction from natural language description. Use this when the user wants to add a new expense or income entry.',
                        'parameters' => [
                            'type' => 'object',
                            'properties' => [
                                'account_name' => [
                                    'type' => 'string',
                                    'description' => 'The name of the account used for the transaction',
                                ],
                                'category_name' => [
                                    'type' => 'string',
                                    'description' => 'The name of the category for the transaction',
                                ],
                                'amount' => [
                                    'type' => 'number',
                                    'description' => 'The transaction amount (positive for income, negative for expense)',
                                ],
                                'description' => [
                                    'type' => 'string',
                                    'description' => 'A brief description of the transaction',
                                ],
                                'merchant_name' => [
                                    'type' => ['string', 'null'],
                                    'description' => 'The name of the merchant/store (e.g., "Starbucks", "Steam", "Apple"). Extract from prompt if mentioned, otherwise null',
                                ],
                                'date' => [
                                    'type' => 'string',
                                    'description' => 'The date of the transaction in YYYY-MM-DD format',
                                ],
                            ],
                            'required' => ['account_name', 'category_name', 'amount', 'description', 'date'],
                        ],
                    ],
                ],
                [
                    'type' => 'function',
                    'function' => [
                        'name' => 'list_transactions',
                        'description' => 'List transactions with optional filters. Use this for queries like "show me transactions", "what did I spend this month", "transactions last week", etc.',
                        'parameters' => [
                            'type' => 'object',
                            'properties' => [
                                'start_date' => [
                                    'type' => 'string',
                                    'description' => 'Start date in YYYY-MM-DD format. Use for date range queries. If not provided, defaults to beginning of current month.',
                                    'nullable' => true,
                                ],
                                'end_date' => [
                                    'type' => 'string',
                                    'description' => 'End date in YYYY-MM-DD format. Use for date range queries. If not provided, defaults to today.',
                                    'nullable' => true,
                                ],
                                'category_name' => [
                                    'type' => 'string',
                                    'description' => 'Filter by category name. E.g., "Entertainment", "Food & Dining", "Transportation"',
                                    'nullable' => true,
                                ],
                                'merchant_name' => [
                                    'type' => 'string',
                                    'description' => 'Filter by merchant name. E.g., "Starbucks", "Steam", "Apple"',
                                    'nullable' => true,
                                ],
                                'account_name' => [
                                    'type' => 'string',
                                    'description' => 'Filter by account name. E.g., "Apple Card", "Bank Account"',
                                    'nullable' => true,
                                ],
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
                ],
                [
                    'type' => 'function',
                    'function' => [
                        'name' => 'get_spending_summary',
                        'description' => 'Get total spending or income summary for a time period. Use for queries like "how much did I spend this month", "total income this week", etc.',
                        'parameters' => [
                            'type' => 'object',
                            'properties' => [
                                'start_date' => [
                                    'type' => 'string',
                                    'description' => 'Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.',
                                    'nullable' => true,
                                ],
                                'end_date' => [
                                    'type' => 'string',
                                    'description' => 'End date in YYYY-MM-DD format. If not provided, defaults to today.',
                                    'nullable' => true,
                                ],
                                'type' => [
                                    'type' => 'string',
                                    'description' => 'Type of summary: "expense" for spending, "income" for earnings, "all" for both',
                                    'enum' => ['expense', 'income', 'all'],
                                    'nullable' => true,
                                ],
                                'category_name' => [
                                    'type' => 'string',
                                    'description' => 'Optional category filter. If provided, returns spending only for that category.',
                                    'nullable' => true,
                                ],
                                'account_name' => [
                                    'type' => 'string',
                                    'description' => 'Optional account filter. If provided, returns spending only for that account.',
                                    'nullable' => true,
                                ],
                            ],
                            'required' => [],
                        ],
                    ],
                ],
                [
                    'type' => 'function',
                    'function' => [
                        'name' => 'get_category_breakdown',
                        'description' => 'Get spending breakdown by category. Use for queries like "what categories did I spend on most", "spending by category this month", etc.',
                        'parameters' => [
                            'type' => 'object',
                            'properties' => [
                                'start_date' => [
                                    'type' => 'string',
                                    'description' => 'Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.',
                                    'nullable' => true,
                                ],
                                'end_date' => [
                                    'type' => 'string',
                                    'description' => 'End date in YYYY-MM-DD format. If not provided, defaults to today.',
                                    'nullable' => true,
                                ],
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
                ],
                [
                    'type' => 'function',
                    'function' => [
                        'name' => 'get_account_breakdown',
                        'description' => 'Get spending breakdown by account. Use for queries like "how much did I spend from each account", "account spending this month", etc.',
                        'parameters' => [
                            'type' => 'object',
                            'properties' => [
                                'start_date' => [
                                    'type' => 'string',
                                    'description' => 'Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.',
                                    'nullable' => true,
                                ],
                                'end_date' => [
                                    'type' => 'string',
                                    'description' => 'End date in YYYY-MM-DD format. If not provided, defaults to today.',
                                    'nullable' => true,
                                ],
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
                ],
                [
                    'type' => 'function',
                    'function' => [
                        'name' => 'get_merchant_breakdown',
                        'description' => 'Get spending breakdown by merchant. Use for queries like "what merchants did I spend at most", "spending by merchant this month", "how much did I spend at Starbucks", etc.',
                        'parameters' => [
                            'type' => 'object',
                            'properties' => [
                                'start_date' => [
                                    'type' => 'string',
                                    'description' => 'Start date in YYYY-MM-DD format. If not provided, defaults to beginning of current month.',
                                    'nullable' => true,
                                ],
                                'end_date' => [
                                    'type' => 'string',
                                    'description' => 'End date in YYYY-MM-DD format. If not provided, defaults to today.',
                                    'nullable' => true,
                                ],
                                'merchant_name' => [
                                    'type' => 'string',
                                    'description' => 'Filter to a specific merchant. E.g., "Starbucks", "Steam"',
                                    'nullable' => true,
                                ],
                            ],
                            'required' => [],
                        ],
                    ],
                ],
                [
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
                ],
            ],
            'tool_choice' => 'auto',
        ];

        $response = $this->request('POST', '/chat/completions', $payload);

        Log::debug('OpenAI Function Calling Response', ['response' => $response]);

        $message = $response['choices'][0]['message'] ?? [];

        if (isset($message['tool_calls']) && ! empty($message['tool_calls'])) {
            $toolCall = $message['tool_calls'][0];
            $functionName = $toolCall['function']['name'] ?? '';
            $arguments = json_decode($toolCall['function']['arguments'] ?? '{}', true);

            return [
                'function' => $functionName,
                'arguments' => $arguments,
            ];
        }

        return [
            'function' => 'chat',
            'arguments' => ['response' => $message['content'] ?? ''],
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
            throw new Exception('cURL error: '.$error);
        }

        if ($httpCode >= 400) {
            throw new Exception('OpenAI API error: '.$response);
        }

        return json_decode($response, true);
    }
}
