<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsAccountYearly extends Model
{
    protected $table = 'analytics_account_yearly';

    protected $fillable = ['user_id', 'account_id', 'year', 'income', 'expense'];

    protected function casts(): array
    {
        return [
            'income' => 'decimal:2',
            'expense' => 'decimal:2',
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
}
