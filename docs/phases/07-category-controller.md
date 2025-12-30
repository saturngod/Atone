# Phase 07: Category Controller & Form Request

## Objective

Create Category controller with full CRUD operations and validation.

## Files to Create

- `app/Http/Requests/CategoryStoreRequest.php`
- `app/Http/Requests/CategoryUpdateRequest.php`
- `app/Http/Controllers/CategoryController.php`

## CategoryStoreRequest.php

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
```

## CategoryUpdateRequest.php

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
```

## CategoryController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = $request->user()
            ->categories()
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
```

## Rollback Plan

- Delete the 3 files
- Remove routes

## Success Criteria

- Controller handles all CRUD operations
- Validation rules defined
- Transaction existence check on delete
