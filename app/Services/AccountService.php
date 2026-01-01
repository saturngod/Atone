<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;

class AccountService
{
    public function getAccountsForUser(User $user): Collection
    {
        return $user->accounts()
            ->orderBy('name')
            ->get();
    }

    public function createAccount(User $user, array $data): Account
    {
        return $user->accounts()->create($data);
    }

    public function updateAccount(Account $account, array $data): bool
    {
        return $account->update($data);
    }

    public function deleteAccount(Account $account): bool
    {
        if ($account->transactions()->exists()) {
            throw new InvalidArgumentException('Cannot delete account with transactions.');
        }

        return $account->delete();
    }
}
