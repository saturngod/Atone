<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AccountStoreRequest;
use App\Http\Requests\AccountUpdateRequest;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use InvalidArgumentException;

class AccountController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private AccountService $accountService,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('Accounts/Index', [
            'accounts' => $this->accountService->getAccountsForUser($request->user()),
        ]);
    }

    public function store(AccountStoreRequest $request)
    {
        $this->accountService->createAccount($request->user(), $request->validated());

        return back()->with('success', 'Account created successfully.');
    }

    public function update(AccountUpdateRequest $request, Account $account)
    {
        $this->authorize('update', $account);
        $this->accountService->updateAccount($account, $request->validated());

        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(Account $account)
    {
        $this->authorize('delete', $account);

        try {
            $this->accountService->deleteAccount($account);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Account deleted successfully.');
    }
}
