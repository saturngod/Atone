# Phase 03: Database Factories

## Objective

Create factories for testing and seeding.

## Files to Create

- `database/factories/AccountFactory.php`
- `database/factories/CategoryFactory.php`
- `database/factories/TransactionFactory.php`

## Factory Definitions

### AccountFactory.php

```php
<?php

namespace Database\Factories;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'name' => $this->faker->word(),
            'color' => $this->faker->hexColor(),
        ];
    }
}
```

### CategoryFactory.php

```php
<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'name' => $this->faker->word(),
        ];
    }
}
```

### TransactionFactory.php

```php
<?php

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
```

## Rollback Plan

- Delete the 3 factory files

## Success Criteria

- Factories can create model instances
- Useful for testing
