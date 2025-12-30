# Phase 12: Transaction Controller & Form Request

## Objective

Create Transaction controller with CRUD and smart category creation.

## Files to Create

- `app/Http/Requests/TransactionStoreRequest.php`
- `app/Http/Requests/TransactionUpdateRequest.php`
- `app/Http/Controllers/TransactionController.php`

## TransactionStoreRequest.php

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'exists:accounts,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'category_name' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric'],
            'description' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'date'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (empty($this->category_id) && empty($this->category_name)) {
                $validator->errors()->add('category_id', 'Please select or create a category.');
            }
        });
    }
}
```

## TransactionUpdateRequest.php

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'exists:accounts,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'amount' => ['required', 'numeric'],
            'description' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'date'],
        ];
    }
}
```

## TransactionController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionStoreRequest;
use App\Http\Requests\TransactionUpdateRequest;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = $request->user()
            ->transactions()
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $accounts = $request->user()->accounts()->pluck('name', 'id');
        $categories = $request->user()->categories()->pluck('name', 'id');

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    public function store(TransactionStoreRequest $request)
    {
        $categoryId = $request->category_id;

        if (empty($categoryId) && $request->category_name) {
            $category = $request->user()->categories()->firstOrCreate([
                'name' => $request->category_name,
            ]);
            $categoryId = $category->id;
        }

        $transaction = $request->user()->transactions()->create([
            'account_id' => $request->account_id,
            'category_id' => $categoryId,
            'amount' => $request->amount,
            'description' => $request->description,
            'date' => $request->date,
        ]);

        return back()->with('success', 'Transaction added.');
    }

    public function update(TransactionUpdateRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        $transaction->update($request->validated());

        return back()->with('success', 'Transaction updated.');
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);

        $transaction->delete();

        return back()->with('success', 'Transaction deleted.');
    }
}
```

## Rollback Plan

- Delete the 3 files
- Remove routes

## Success Criteria

- Controller handles CRUD
- Smart category creation works
- Authorization checks in place
