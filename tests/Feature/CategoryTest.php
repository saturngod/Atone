<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('lists categories for authenticated user', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    actingAs($user)->get('/categories')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('categories'));
});

it('creates category successfully', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/categories', [
        'name' => 'Food',
    ])->assertRedirect();

    expect(Category::where('user_id', $user->id)->where('name', 'Food')->exists())->toBeTrue();
});

it('updates category successfully', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    actingAs($user)->put("/categories/{$category->id}", [
        'name' => 'Updated Category',
    ])->assertRedirect();

    expect(Category::find($category->id)->name)->toBe('Updated Category');
});

it('cannot delete category with transactions', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);
    Transaction::factory()->create(['category_id' => $category->id]);

    actingAs($user)->delete("/categories/{$category->id}")
        ->assertSessionHas('error');

    expect(Category::find($category->id))->not->toBeNull();
});
