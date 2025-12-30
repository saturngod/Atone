<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;
use function Pest\Laravel\delete;

uses(RefreshDatabase::class);

it('lists transactions for authenticated user', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create(['user_id' => $user->id]);
    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
    ]);

    actingAs($user)->get('/transactions')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('transactions'));
});

it('creates transaction with existing category', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create(['user_id' => $user->id]);

    actingAs($user)->post('/transactions', [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => -50.00,
        'description' => 'Test expense',
        'date' => today()->toDateString(),
    ])->assertRedirect();

    expect(Transaction::where('user_id', $user->id)->where('amount', -50)->exists())->toBeTrue();
});

it('creates transaction with new category', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    actingAs($user)->post('/transactions', [
        'account_id' => $account->id,
        'category_name' => 'New Category',
        'amount' => -25.00,
        'description' => 'Test expense',
        'date' => today()->toDateString(),
    ])->assertRedirect();

    expect(Transaction::where('user_id', $user->id)->exists())->toBeTrue();
    expect(Category::where('user_id', $user->id)->where('name', 'New Category')->exists())->toBeTrue();
});

it('updates transaction successfully', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create(['user_id' => $user->id]);
    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => -50.00,
    ]);

    actingAs($user)->put("/transactions/{$transaction->id}", [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => -100.00,
        'description' => 'Updated',
        'date' => today()->toDateString(),
    ])->assertRedirect();

    expect((float) Transaction::find($transaction->id)->amount)->toBe(-100.0);
});

it('deletes transaction successfully', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create(['user_id' => $user->id]);
    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
    ]);

    actingAs($user)->delete("/transactions/{$transaction->id}")
        ->assertRedirect();

    expect(Transaction::find($transaction->id))->toBeNull();
});

it('requires category or category_name', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    actingAs($user)->post('/transactions', [
        'account_id' => $account->id,
        'amount' => -50.00,
        'date' => today()->toDateString(),
    ])->assertSessionHasErrors(['category_name']);
});
