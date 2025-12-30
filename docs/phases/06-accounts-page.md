# Phase 06: Accounts Page Component

## Objective

Create the Accounts index page with list, create, edit, and delete functionality.

## Files to Create

- `resources/js/Pages/Accounts/Index.tsx`

## Component Structure

- Page title "Accounts"
- List of accounts with color indicator
- "Add Account" button triggering dialog
- Edit inline or modal
- Delete with confirmation
- Optimistic updates

## Shadcn UI Components Needed

- `Dialog` (for create/edit form)
- `Button`
- `Input` (for name)
- `ColorPicker` or simple `Input` (for hex color)
- `Table` (for account list)
- `DropdownMenu` or `Button` (for actions)
- `ConfirmDialog` (for delete confirmation)
- `useToast` (for success/error feedback)

## Page Props

```typescript
interface PageProps {
    accounts: Account[];
}
```

## Rollback Plan

- Delete the Index.tsx file

## Success Criteria

- Page renders without errors
- Can create new account
- Can edit existing account
- Can delete account (with transaction check)
