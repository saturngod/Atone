<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsMonthly extends Model
{
    protected $table = 'analytics_monthly';

    protected $fillable = ['user_id', 'year', 'month', 'income', 'expense'];

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
}
