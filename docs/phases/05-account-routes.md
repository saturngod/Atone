# Phase 05: Account Routes

## Objective

Define web routes for Account CRUD operations.

## Files to Modify

- `routes/web.php` (add these routes)

## Route Definitions

```php
Route::prefix('accounts')->name('accounts.')->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('index');
    Route::post('/', [AccountController::class, 'store'])->name('store');
    Route::put('/{account}', [AccountController::class, 'update'])->name('update');
    Route::delete('/{account}', [AccountController::class, 'destroy'])->name('destroy');
})->middleware(['auth', 'verified']);
```

## Rollback Plan

- Remove the route group from web.php

## Success Criteria

- `php artisan route:list` shows all account routes
- Routes are named correctly
