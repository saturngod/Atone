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
                    'content' => 'You are a financial transaction assistant. Extract transaction details from natural language and output ONLY valid JSON. Do not explain. Do not add markdown. Output format: {"account_name": "string", "category_name": "string", "amount": number, "description": "string", "date": "YYYY-MM-DD"}. Rules: - Use "Entertainment" for games, movies, streaming. - Use "Food & Dining" for restaurants, coffee, groceries. - Use "Income" for salary, deposits. - Amount negative for expenses, positive for income. - Date in YYYY-MM-DD format. Convert "yesterday" to actual date.',
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
