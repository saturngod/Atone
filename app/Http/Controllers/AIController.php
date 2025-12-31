<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function createTransaction(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string'],
        ]);

        $transaction = Transaction::createFromAIPrompt(
            $request->user(),
            $request->input('prompt')
        );

        return response()->json([
            'message' => 'Transaction created successfully',
            'transaction' => $transaction,
        ]);
    }
}
