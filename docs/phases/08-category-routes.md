# Phase 08: Category Routes

## Objective

Define web routes for Category CRUD operations.

## Files to Modify

- `routes/web.php` (add these routes)

## Route Definitions

```php
Route::prefix('categories')->name('categories.')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('index');
    Route::post('/', [CategoryController::class, 'store'])->name('store');
    Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
    Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
})->middleware(['auth', 'verified']);
```

## Rollback Plan

- Remove the route group from web.php

## Success Criteria

- `php artisan route:list` shows all category routes
- Routes are named correctly
