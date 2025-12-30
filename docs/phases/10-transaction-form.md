# Phase 10: Transaction Form Component (Hero Feature)

## Objective

Create the high-speed transaction entry form with smart category creation.

## Files to Create

- `resources/js/Components/TransactionForm.tsx`

## Feature Requirements

- Amount input (auto-focus)
- Description input (optional)
- Category combobox with autocomplete
- Smart create: if category doesn't exist, show "Create 'X'" option
- Account selector
- Date picker (default to today)
- Optimistic UI updates (use `Inertia.Form` with `onBefore`)

## Shadcn UI Components Needed

- `Form` (Inertia Form)
- `Input` (amount, description)
- `Combobox` (category selection with custom creation)
- `Select` (account picker)
- `Popover` / `Calendar` (date picker)
- `Button`

## Combobox Behavior

```
User types: "Dinn"
Options: ["Dining Out", "Dinner"]
User types: "Dinnerextra" (doesn't exist)
UI shows: Create "Dinnerextra"
On submit: Backend creates category, returns ID
```

## Smart Category Logic

```typescript
const handleCategoryChange = (value: string) => {
    const exists = categories.some(
        (c) => c.name.toLowerCase() === value.toLowerCase(),
    );
    if (!exists) {
        setShowCreateOption(true);
    }
};
```

## Rollback Plan

- Delete TransactionForm.tsx

## Success Criteria

- Form is visible and focused on mount
- Category combobox works with autocomplete
- New categories can be created inline
- Form submits via Inertia
