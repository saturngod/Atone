<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;
use function Pest\Laravel\delete;

uses(RefreshDatabase::class);

it('lists accounts for authenticated user', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    actingAs($user)->get('/accounts')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('accounts'));
});

it('creates account with valid data', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/accounts', [
        'name' => 'Test Account',
        'color' => '#3b82f6',
    ])->assertRedirect();

    expect(Account::where('user_id', $user->id)->where('name', 'Test Account')->exists())->toBeTrue();
});

it('validates account color format', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/accounts', [
        'name' => 'Test Account',
        'color' => 'invalid',
    ])->assertSessionHasErrors(['color']);
});

it('updates account successfully', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    actingAs($user)->put("/accounts/{$account->id}", [
        'name' => 'Updated',
        'color' => '#ef4444',
    ])->assertRedirect();

    expect(Account::find($account->id)->name)->toBe('Updated');
});

it('cannot delete account with transactions', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    Transaction::factory()->create(['account_id' => $account->id]);

    actingAs($user)->delete("/accounts/{$account->id}")
        ->assertSessionHas('error');

    expect(Account::find($account->id))->not->toBeNull();
});
