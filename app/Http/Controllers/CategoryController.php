<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Category;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $categories = $request->user()
            ->categories()
            ->withCount('transactions')
            ->orderBy('name')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(CategoryStoreRequest $request)
    {
        $category = $request->user()->categories()->create($request->validated());

        return back()->with('success', 'Category created successfully.');
    }

    public function update(CategoryUpdateRequest $request, Category $category)
    {
        $this->authorize('update', $category);

        $category->update($request->validated());

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        if ($category->transactions()->exists()) {
            return back()->with('error', 'Cannot delete category with transactions.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
