<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AccountStoreRequest;
use App\Http\Requests\AccountUpdateRequest;
use App\Models\Account;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    use AuthorizesRequests;
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
