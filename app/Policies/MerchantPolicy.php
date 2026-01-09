<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Merchant;
use App\Models\User;

class MerchantPolicy
{
    public function view(User $user, Merchant $merchant): bool
    {
        return $merchant->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Merchant $merchant): bool
    {
        return $merchant->user_id === $user->id;
    }

    public function delete(User $user, Merchant $merchant): bool
    {
        return $merchant->user_id === $user->id;
    }
}
