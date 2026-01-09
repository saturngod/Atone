<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Merchant;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;

class MerchantService
{
    public function getMerchantsForUser(User $user): Collection
    {
        return $user->merchants()
            ->orderBy('name')
            ->get();
    }

    public function createMerchant(User $user, array $data): Merchant
    {
        return $user->merchants()->create($data);
    }

    public function findOrCreateMerchant(User $user, string $name): Merchant
    {
        return $user->merchants()->firstOrCreate(['name' => $name]);
    }

    public function updateMerchant(Merchant $merchant, array $data): bool
    {
        return $merchant->update($data);
    }

    public function deleteMerchant(Merchant $merchant): bool
    {
        if ($merchant->transactions()->exists()) {
            throw new InvalidArgumentException('Cannot delete merchant with transactions.');
        }

        return $merchant->delete();
    }
}
