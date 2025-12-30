# Phase 13: Transaction Routes

## Objective

Define web routes for Transaction CRUD operations.

## Files to Modify

- `routes/web.php` (add these routes)

## Route Definitions

```php
Route::prefix('transactions')->name('transactions.')->group(function () {
    Route::get('/', [TransactionController::class, 'index'])->name('index');
    Route::post('/', [TransactionController::class, 'store'])->name('store');
    Route::put('/{transaction}', [TransactionController::class, 'update'])->name('update');
    Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy');
})->middleware(['auth', 'verified']);
```

## Rollback Plan

- Remove the route group from web.php

## Success Criteria

- `php artisan route:list` shows all transaction routes
- Routes are named correctly
