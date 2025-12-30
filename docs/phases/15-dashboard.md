# Phase 15: Dashboard Summary View

## Objective

Create a dashboard showing balance overview and income/expense summary.

## Files to Create

- `app/Http/Controllers/DashboardController.php`
- `resources/js/Pages/Dashboard.tsx`

## DashboardController.php

```php
<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $totalBalance = $user->accounts()
            ->withSum('transactions', 'amount')
            ->get()
            ->sum(fn ($account) => $account->transactions_sum_amount ?? 0);

        $currentMonthIncome = $user->transactions()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->where('amount', '>', 0)
            ->sum('amount');

        $currentMonthExpenses = $user->transactions()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->where('amount', '<', 0)
            ->sum('amount');

        $recentTransactions = $user->transactions()
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'totalBalance' => $totalBalance,
            'currentMonthIncome' => $currentMonthIncome,
            'currentMonthExpenses' => abs($currentMonthExpenses),
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
```

## Dashboard.tsx

- Total balance card
- Current month income card
- Current month expenses card
- Recent transactions list
- Optional: Simple bar chart (if needed)

## Shadcn UI Components Needed

- `Card` (for summary cards)
- `Table` (for recent transactions)
- `Button` (view all transactions)

## Route to Add

```php
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard')
    ->middleware(['auth', 'verified']);
```

## Rollback Plan

- Delete Dashboard.tsx and DashboardController.php
- Remove route

## Success Criteria

- Dashboard shows correct balance
- Income/expense calculations accurate
- Recent transactions list displays
