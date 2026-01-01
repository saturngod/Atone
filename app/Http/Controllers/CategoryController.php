<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use InvalidArgumentException;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private CategoryService $categoryService,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('Categories/Index', [
            'categories' => $this->categoryService->getCategoriesForUser($request->user()),
        ]);
    }

    public function store(CategoryStoreRequest $request)
    {
        $this->categoryService->createCategory($request->user(), $request->validated());

        return back()->with('success', 'Category created successfully.');
    }

    public function update(CategoryUpdateRequest $request, Category $category)
    {
        $this->authorize('update', $category);
        $this->categoryService->updateCategory($category, $request->validated());

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        try {
            $this->categoryService->deleteCategory($category);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Category deleted successfully.');
    }
}
