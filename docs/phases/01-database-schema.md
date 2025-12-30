# Phase 01: Database Schema Setup

## Objective

Create the foundational database migrations for Accounts, Categories, and Transactions.

## Files to Create/Modify

- `database/migrations/*_create_accounts_table.php`
- `database/migrations/*_create_categories_table.php`
- `database/migrations/*_create_transactions_table.php`

## Migration Details

### Accounts Table

```php
Schema::create('accounts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('color')->default('#3b82f6');
    $table->timestamps();
});
```

### Categories Table

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->timestamps();
});
```

### Transactions Table

```php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('account_id')->constrained()->cascadeOnDelete();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->decimal('amount', 10, 2);
    $table->string('description')->nullable();
    $table->date('date')->default(today());
    $table->timestamps();
});
```

## Rollback Plan

- Run `php artisan migrate:rollback`
- Delete migration files

## Success Criteria

- All 3 migrations run successfully
- Tables created with correct foreign key constraints
