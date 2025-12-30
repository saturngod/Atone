# Phase 17: Authorization Policies

## Objective

Create Eloquent policies for Account, Category, and Transaction.

## Files to Create

- `app/Policies/AccountPolicy.php`
- `app/Policies/CategoryPolicy.php`
- `app/Policies/TransactionPolicy.php`

## AccountPolicy.php

```php
<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;

class AccountPolicy
{
    public function view(User $user, Account $account): bool
    {
        return $account->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Account $account): bool
    {
        return $account->user_id === $user->id;
    }

    public function delete(User $user, Account $account): bool
    {
        return $account->user_id === $user->id;
    }
}
```

## CategoryPolicy.php

```php
<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function view(User $user, Category $category): bool
    {
        return $category->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Category $category): bool
    {
        return $category->user_id === $user->id;
    }

    public function delete(User $user, Category $category): bool
    {
        return $category->user_id === $user->id;
    }
}
```

## TransactionPolicy.php

```php
<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function view(User $user, Transaction $transaction): bool
    {
        return $transaction->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Transaction $transaction): bool
    {
        return $transaction->user_id === $user->id;
    }

    public function delete(User $user, Transaction $transaction): bool
    {
        return $transaction->user_id === $user->id;
    }
}
```

## Register Policies (AuthServiceProvider)

Add to `AppServiceProvider` or create provider:

```php
protected $policies = [
    Account::class => AccountPolicy::class,
    Category::class => CategoryPolicy::class,
    Transaction::class => TransactionPolicy::class,
];
```

## Rollback Plan

- Delete policy files
- Remove from provider

## Success Criteria

- Policies properly authorize actions
- User can only access own data
