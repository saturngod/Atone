<?php

use App\Models\Account;
use App\Models\AnalyticsMerchantDaily;
use App\Models\Category;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

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

it('creates transaction with new merchant', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    actingAs($user)->post('/transactions', [
        'account_id' => $account->id,
        'category_name' => 'Food',
        'merchant_name' => 'Starbucks',
        'amount' => -25.00,
        'description' => 'Coffee',
        'date' => today()->toDateString(),
    ])->assertRedirect();

    expect(Transaction::where('user_id', $user->id)->exists())->toBeTrue();
    expect(Merchant::where('user_id', $user->id)->where('name', 'Starbucks')->exists())->toBeTrue();
});

it('creates transaction with existing merchant', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $merchant = Merchant::factory()->create(['user_id' => $user->id, 'name' => 'Amazon']);

    actingAs($user)->post('/transactions', [
        'account_id' => $account->id,
        'category_name' => 'Shopping',
        'merchant_name' => 'Amazon',
        'amount' => -100.00,
        'description' => 'Purchase',
        'date' => today()->toDateString(),
    ])->assertRedirect();

    expect(Transaction::where('user_id', $user->id)->where('merchant_id', $merchant->id)->exists())->toBeTrue();
    expect(Merchant::where('name', 'Amazon')->count())->toBe(1);
});

it('updates transaction with merchant change', function () {
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
        'merchant_name' => 'Target',
        'amount' => -75.00,
        'description' => 'Updated with merchant',
        'date' => today()->toDateString(),
    ])->assertRedirect();

    $updatedTransaction = Transaction::with('merchant')->find($transaction->id);
    expect((float) $updatedTransaction->amount)->toBe(-75.0);
    expect($updatedTransaction->merchant->name)->toBe('Target');
});

it('creates merchant analytics when transaction is created', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);
    $today = today()->toDateString();

    Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'merchant_id' => $merchant->id,
        'amount' => -100.00,
        'date' => $today,
    ]);

    $analytics = AnalyticsMerchantDaily::where('merchant_id', $merchant->id)
        ->where('date', $today)
        ->first();

    expect($analytics)->not->toBeNull();
    expect((float) $analytics->amount)->toBe(100.0);
});

it('updates merchant analytics when transaction merchant changes', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $merchant1 = Merchant::factory()->create(['user_id' => $user->id]);
    $merchant2 = Merchant::factory()->create(['user_id' => $user->id]);
    $today = today()->toDateString();

    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'merchant_id' => $merchant1->id,
        'amount' => -100.00,
        'date' => $today,
    ]);

    // Verify merchant1 has analytics
    $analytics1 = AnalyticsMerchantDaily::where('merchant_id', $merchant1->id)
        ->where('date', $today)
        ->first();
    expect((float) $analytics1->amount)->toBe(100.0);

    // Change merchant
    $transaction->update(['merchant_id' => $merchant2->id]);

    // Refresh analytics from DB
    $analytics1Updated = AnalyticsMerchantDaily::where('merchant_id', $merchant1->id)
        ->where('date', $today)
        ->first();
    $analytics2 = AnalyticsMerchantDaily::where('merchant_id', $merchant2->id)
        ->where('date', $today)
        ->first();

    // Merchant1 should have 0 (reverted), Merchant2 should have 100
    expect((float) $analytics1Updated->amount)->toBe(0.0);
    expect((float) $analytics2->amount)->toBe(100.0);
});
