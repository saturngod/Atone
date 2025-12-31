<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Merchant extends Model
{
    /** @use HasFactory<\Database\Factories\MerchantFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'name'];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
