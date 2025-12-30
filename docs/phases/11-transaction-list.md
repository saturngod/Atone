# Phase 11: Transaction List Component

## Objective

Create a sortable, groupable transaction list table.

## Files to Create

- `resources/js/Components/TransactionList.tsx`

## Feature Requirements

- Table with columns: Date | Description | Category | Account | Amount | Actions
- Sort by date (newest first, default)
- Group headers: "Today", "Yesterday", "Last 7 Days", "Older"
- Mobile: Convert table to card list on small screens
- Empty state with skeleton animation

## Shadcn UI Components Needed

- `Table` / `Card` (responsive)
- `Button` (sorting)
- `DropdownMenu` (row actions)
- `Dialog` (edit modal)
- `ConfirmDialog` (delete confirmation)
- `Badge` (category/account display)

## Grouping Logic

```typescript
const groupedTransactions = transactions.reduce((groups, transaction) => {
    const dateKey = getDateGroupKey(transaction.date);
    if (!groups[dateKey]) {
        groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
}, {});
```

## Actions Menu

- Edit (opens modal with form pre-filled)
- Delete (with confirmation)

## Rollback Plan

- Delete TransactionList.tsx

## Success Criteria

- Transactions display in table
- Grouping works correctly
- Mobile responsive
- Actions work
