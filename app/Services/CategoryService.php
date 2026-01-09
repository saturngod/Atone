<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;

class CategoryService
{
    public function getCategoriesForUser(User $user): Collection
    {
        return $user->categories()
            ->orderBy('name')
            ->get();
    }

    public function createCategory(User $user, array $data): Category
    {
        return $user->categories()->create($data);
    }

    public function findOrCreateCategory(User $user, string $name): Category
    {
        return $user->categories()->firstOrCreate(['name' => $name]);
    }

    public function updateCategory(Category $category, array $data): bool
    {
        return $category->update($data);
    }

    public function deleteCategory(Category $category): bool
    {
        if ($category->transactions()->exists()) {
            throw new InvalidArgumentException('Cannot delete category with transactions.');
        }

        return $category->delete();
    }
}
