# Phase 04: Account Controller & Form Request

## Objective

Create Account controller with full CRUD operations and validation.

## Files to Create

- `app/Http/Requests/AccountStoreRequest.php`
- `app/Http/Requests/AccountUpdateRequest.php`
- `app/Http/Controllers/AccountController.php`

## AccountStoreRequest.php

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AccountStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'color.regex' => 'The color must be a valid hex code (e.g., #3b82f6).',
        ];
    }
}
```

## AccountUpdateRequest.php

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AccountUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }
}
```

## AccountController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountStoreRequest;
use App\Http\Requests\AccountUpdateRequest;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $accounts = $request->user()
            ->accounts()
            ->orderBy('name')
            ->get();

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(AccountStoreRequest $request)
    {
        $account = $request->user()->accounts()->create($request->validated());

        return back()->with('success', 'Account created successfully.');
    }

    public function update(AccountUpdateRequest $request, Account $account)
    {
        $this->authorize('update', $account);

        $account->update($request->validated());

        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(Account $account)
    {
        $this->authorize('delete', $account);

        if ($account->transactions()->exists()) {
            return back()->with('error', 'Cannot delete account with transactions.');
        }

        $account->delete();

        return back()->with('success', 'Account deleted successfully.');
    }
}
```

## Rollback Plan

- Delete the 3 files
- Remove routes from web.php

## Success Criteria

- Controller handles all CRUD operations
- Authorization check in place
- Validation rules defined
