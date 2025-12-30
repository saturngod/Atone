# Phase 14: Transactions Page Component

## Objective

Create the main Transactions index page combining form and list.

## Files to Create

- `resources/js/Pages/Transactions/Index.tsx`

## Component Structure

- Page layout with TransactionForm at top
- TransactionList below
- Shared state for accounts and categories

## Page Props

```typescript
interface PageProps {
    transactions: Transaction[];
    accounts: { id: number; name: string }[];
    categories: { id: number; name: string }[];
}
```

## Layout

```
+----------------------------------+
|  Transaction Entry Form          |
|  (Highly visible, top of page)   |
+----------------------------------+
|  Transaction List                |
|  (Sortable table with groups)    |
+----------------------------------+
```

## Rollback Plan

- Delete Index.tsx

## Success Criteria

- Page renders form and list
- Form can submit transactions
- List displays transactions
- Navigation works
