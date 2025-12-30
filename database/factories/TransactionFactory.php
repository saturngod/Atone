<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'account_id' => \App\Models\Account::factory(),
            'category_id' => \App\Models\Category::factory(),
            'amount' => $this->faker->randomFloat(2, -1000, 1000),
            'description' => $this->faker->sentence(),
            'date' => $this->faker->date(),
        ];
    }
}
