# Phase 09: Categories Page Component

## Objective

Create the Categories index page with list, create, edit, and delete functionality.

## Files to Create

- `resources/js/Pages/Categories/Index.tsx`

## Component Structure

- Page title "Categories"
- List of categories
- "Add Category" button triggering dialog
- Edit inline or modal
- Delete with confirmation
- Usage count indicator (optional)

## Shadcn UI Components Needed

- `Dialog` (for create/edit form)
- `Button`
- `Input` (for name)
- `Table` (for category list)
- `ConfirmDialog` (for delete confirmation)
- `useToast` (for feedback)

## Page Props

```typescript
interface PageProps {
    categories: Category[];
}
```

## Rollback Plan

- Delete the Index.tsx file

## Success Criteria

- Page renders without errors
- Can create new category
- Can edit existing category
- Can delete category (with transaction check)
