# Phase 19: Feature Tests

## Objective

Write comprehensive feature tests for all CRUD operations.

## Files to Create

- `tests/Feature/AccountTest.php`
- `tests/Feature/CategoryTest.php`
- `tests/Feature/TransactionTest.php`

## AccountTest.php

```php
<?php

use App\Models\Account;
use App\Models\User;

it('can list accounts', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get('/accounts');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('accounts'));
});

it('can create account', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/accounts', [
        'name' => 'Test Account',
        'color' => '#3b82f6',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'user_id' => $user->id,
        'name' => 'Test Account',
    ]);
});

it('can update account', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->put("/accounts/{$account->id}", [
        'name' => 'Updated Account',
        'color' => '#ef4444',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'id' => $account->id,
        'name' => 'Updated Account',
    ]);
});

it('cannot delete account with transactions', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    Transaction::factory()->create(['account_id' => $account->id]);

    $response = $this->actingAs($user)->delete("/accounts/{$account->id}");

    $response->assertSessionHas('error');
    $this->assertModelExists($account);
});
```

## Similar Tests for Category and Transaction

## Rollback Plan

- Delete test files

## Success Criteria

- All tests pass
- `php artisan test` runs successfully
