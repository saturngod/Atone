<?php

declare(strict_types=1);

namespace App\Models;

use App\Services\OpenAIService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'account_id', 'category_id', 'amount', 'description', 'date'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public static function createFromAIPrompt(User $user, string $prompt): Transaction
    {
        $openai = app(OpenAIService::class);
        $parsed = $openai->parseTransactionPrompt($prompt);

        $account = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => $parsed['account_name']],
            ['color' => '#3B82F6']
        );

        $category = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => $parsed['category_name']]
        );

        return Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'amount' => $parsed['amount'],
            'description' => $parsed['description'],
            'date' => $parsed['date'],
        ]);
    }
}
