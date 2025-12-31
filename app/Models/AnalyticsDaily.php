<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsDaily extends Model
{
    protected $table = 'analytics_daily';

    protected $fillable = ['user_id', 'date', 'income', 'expense'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'income' => 'decimal:2',
            'expense' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
