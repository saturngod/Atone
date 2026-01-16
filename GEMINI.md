# Gemini Context: Personal Finance App (SPF)

## Project Overview
**SPF (Simple Personal Finance)** is a minimalist, AI-powered personal finance tracker built with **Laravel 12** and **React 19** (via **Inertia.js**). It features natural language transaction entry, automated analytics, and a clean, responsive UI using **Tailwind CSS v4** and **Shadcn UI**.

### Key Technologies
*   **Backend:** PHP 8.2+, Laravel 12, SQLite (Dev) / MySQL/PostgreSQL (Prod).
*   **Frontend:** React 19, TypeScript, Inertia.js, Tailwind CSS v4, Radix UI / Shadcn.
*   **AI/ML:** OpenAI API integration (GPT-4o/mini) or NVIDIA Nemotron for parsing natural language transactions.
*   **Testing:** Pest (PHP), standard React testing tools.
*   **Tooling:** Vite, ESLint, Prettier, Laravel Pint, Husky.

---

## Folder Structure

### Backend (`app/`)
```
app/
├── Actions/              # Single-purpose action classes
├── Console/Commands/     # Artisan commands (e.g., GenerateDemoData)
├── Exceptions/           # Custom exception handlers
├── Http/
│   ├── Controllers/      # Request handlers (skinny controllers)
│   ├── Middleware/       # HTTP middleware
│   └── Requests/         # Form Request validation classes
├── Models/               # Eloquent models
│   ├── User.php
│   ├── Account.php
│   ├── Category.php
│   ├── Merchant.php
│   ├── Transaction.php
│   └── Analytics*.php    # Pre-aggregated analytics models (Daily/Monthly/Yearly)
├── Observers/            # Model observers (e.g., TransactionObserver)
├── Policies/             # Authorization policies
├── Providers/            # Service providers
└── Services/             # Core business logic
    ├── OpenAIService.php           # LLM interactions for AI features
    ├── AnalyticsService.php        # Data aggregation & stats
    ├── TransactionService.php      # Transaction CRUD operations
    ├── TransactionQueryService.php # Complex transaction queries
    ├── AccountService.php          # Account management
    ├── CategoryService.php         # Category management
    ├── MerchantService.php         # Merchant management
    └── DashboardService.php        # Dashboard data aggregation
```

### Frontend (`resources/js/`)
```
resources/js/
├── pages/                # Inertia page components
│   ├── Dashboard.tsx     # Main dashboard with analytics
│   ├── Transactions/     # Transaction list & management
│   ├── Accounts/         # Account management
│   ├── Categories/       # Category management
│   ├── Merchants/        # Merchant management
│   ├── AI/               # AI chat interface
│   ├── auth/             # Authentication pages
│   ├── settings/         # User settings & profile
│   └── welcome.tsx       # Landing page
├── components/           # Reusable components
│   ├── ui/               # Shadcn UI primitives (Button, Select, Dialog, etc.)
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   ├── ai-chat-dialog.tsx
│   └── ...               # Other app-specific components
├── hooks/                # Custom React hooks
│   ├── use-timezone.ts   # User timezone handling
│   ├── use-appearance.tsx
│   ├── use-clipboard.ts
│   └── use-mobile.tsx
├── layouts/              # Page layouts (AppLayout, etc.)
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
├── routes/               # Route definitions (wayfinder)
└── wayfinder/            # Auto-generated route helpers
```

---

## Client-Side Filtering Pattern

For lists with moderate data sizes (hundreds to a few thousand items), use **client-side filtering** with `useMemo`. This pattern is used on `/transactions`:

### Implementation Pattern
```tsx
// 1. Define filter state
const [accountFilter, setAccountFilter] = useState('all');
const [categoryFilter, setCategoryFilter] = useState('all');
const [merchantFilter, setMerchantFilter] = useState('all');
const [searchQuery, setSearchQuery] = useState('');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

// 2. Filter with useMemo for performance
const filteredItems = useMemo(() => {
    return items.filter((item) => {
        const matchesAccount = accountFilter === 'all' || 
            item.account?.id.toString() === accountFilter;
        const matchesCategory = categoryFilter === 'all' || 
            item.category?.id.toString() === categoryFilter;
        // ... more filters
        return matchesAccount && matchesCategory && /* ... */;
    });
}, [items, accountFilter, categoryFilter, /* ... dependencies */]);

// 3. Clear filters helper
const clearFilters = () => {
    setAccountFilter('all');
    setCategoryFilter('all');
    setMerchantFilter('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
};

// 4. Track active filters
const hasActiveFilters = accountFilter !== 'all' || 
    categoryFilter !== 'all' || 
    merchantFilter !== 'all' || 
    searchQuery || dateFrom || dateTo;
```

### When to Use Client-Side vs Server-Side Filtering
| Scenario | Approach |
|----------|----------|
| < 5,000 items | Client-side with `useMemo` |
| > 5,000 items or complex queries | Server-side with query params |
| Pagination required | Server-side |
| Real-time search with debounce | Server-side |

---

## Radix UI / Shadcn Select Component Rules

When using `Select` components from Shadcn (based on Radix UI):

### ⚠️ Critical: Empty String Values
**Never use empty string `""` as a `SelectItem` value.** Radix reserves empty string for clearing the selection.

```tsx
// ❌ WRONG - Will throw error
<SelectItem value="">None</SelectItem>

// ✅ CORRECT - Use a placeholder value
<SelectItem value="__none__">None</SelectItem>

// Handle in value binding:
<Select
    value={form.data.field || '__none__'}
    onValueChange={(value) => 
        form.setData('field', value === '__none__' ? '' : value)
    }
>
```

---

## Development Workflow

### Startup
```bash
composer run dev  # Full environment (Laravel + Vite + Queue + Pail)
```
*Alternatively:*
*   **Frontend:** `npm run dev`
*   **Backend:** `php artisan serve`

### Building
```bash
npm run build     # Compile assets for production
npm run build:ssr # Compile for SSR (if enabled)
```

### Database
*   **Migration:** `php artisan migrate`
*   **Seeding:** `php artisan db:seed`
*   **Reset:** `php artisan migrate:fresh --seed`

### Testing & Quality
*   **PHP Tests (Pest):** `php artisan test`
*   **PHP Linting (Pint):** `vendor/bin/pint` (or `--dirty` for changed files)
*   **JS/TS Linting:** `npm run lint`
*   **Formatting:** `npm run format`
*   **Type Checking:** `npm run types`

---

## Conventions & Standards

### Frontend Development
*   **Components:** Functional React components with Hooks. Strong typing with TypeScript.
*   **Styling:** Utility-first with Tailwind CSS. Follow Shadcn UI patterns.
*   **State:** Use `useState` for local state, `useMemo` for derived state.
*   **Forms:** Use Inertia's `useForm` hook for form handling.

### Backend Development
*   **Controllers:** Keep skinny. Delegate logic to Services.
*   **Services:** Core business logic goes in `app/Services/`.
*   **Validation:** Use Form Request classes in `app/Http/Requests/`.
*   **Authorization:** Use Policies in `app/Policies/`.

### Code Quality
*   **Commits:** Conventional Commits format (enforced by Husky).
    *   `feat:` new features
    *   `fix:` bug fixes
    *   `refactor:` code changes without behavior changes
    *   `docs:` documentation updates
*   **AI Integration:** Use `OpenAIService` for all LLM calls.

---

## Adding New Features Checklist

### Adding a New Entity (e.g., "Tags")
1. **Model:** Create `app/Models/Tag.php`
2. **Migration:** Create migration in `database/migrations/`
3. **Service:** Create `app/Services/TagService.php`
4. **Controller:** Create `app/Http/Controllers/TagController.php`
5. **Form Request:** Create validation in `app/Http/Requests/`
6. **Policy:** Create `app/Policies/TagPolicy.php` (if auth needed)
7. **Routes:** Add to `routes/web.php`
8. **Frontend Page:** Create `resources/js/pages/Tags/Index.tsx`

### Adding Filters to a Page
1. Add state variables for each filter
2. Add filter logic in `useMemo`
3. Add UI components (Select dropdowns, inputs)
4. Update `clearFilters` function
5. Update `hasActiveFilters` check

---

## Critical Files
*   `composer.json` / `package.json`: Dependency truth sources
*   `docs/PRD.md`: Feature requirements and "Hero" feature definition
*   `.env`: Configuration (OpenAI keys, DB connection)
*   `vite.config.ts`: Frontend build configuration
*   `GEMINI.md`: This file - AI context and development guidelines
