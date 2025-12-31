# AGENTS.md

## Commands

### Testing

```bash
php artisan test                    # Run all tests
php artisan test tests/Feature/AccountTest.php  # Run specific test file
php artisan test --filter=testName  # Run test by name
npm run types                       # TypeScript type checking
```

### Linting & Formatting

```bash
vendor/bin/pint --dirty             # Format PHP code
npm run lint                        # Lint and fix JavaScript/TypeScript
npm run format                      # Format JavaScript/TypeScript
npm run format:check                # Check formatting without fixing
npm run types                       # TypeScript type check only
```

### Build & Development

```bash
npm run dev                         # Start Vite dev server
npm run build                       # Build for production
composer run dev                    # Full dev environment (PHP + Vite)
composer run dev:ssr                # Dev with SSR enabled
```

## Code Style Guidelines

### PHP

- Use PHP 8 constructor property promotion
- Always use curly braces for control structures (even single-line)
- Explicit return types on all methods/functions
- Use PHPDoc blocks for complex logic, not inline comments
- Enum keys should be TitleCase (e.g., `FavoritePerson`, `Monthly`)
- Use strict types: `declare(strict_types=1);`

### Laravel Conventions

- Use `php artisan make:` commands for new files
- Create Form Request classes for validation (not inline)
- Use Eloquent relationships with return type hints
- Prefer `Model::query()` over raw `DB::` queries
- Use named routes with `route()` helper
- Only use `env()` in config files; use `config()` elsewhere
- Eager load relationships to prevent N+1 queries

### TypeScript / React

- Use explicit TypeScript types
- Import order: CSS → vendor libraries → app imports (see `resources/js/app.tsx`)
- Use `cn()` helper from `utils` for Tailwind class merging
- Use Inertia `<Link>` for navigation, not `<a>` tags
- Use Inertia `<Form>` component for forms
- Follow existing component patterns in `resources/js/components/ui/`

### Tailwind CSS v4

- Use `@import "tailwindcss"` (not `@tailwind` directives)
- Use `bg-black/50` syntax (not `bg-opacity-50`)
- Use `dark:` prefix for dark mode
- Use `gap-*` utilities for spacing (not margins on items)

### General

- Descriptive variable/method names: `isRegisteredForDiscounts`, not `discount()`
- Check sibling files for patterns before implementing new features
- Don't create new base folders without approval
- Don't change dependencies without approval

## Laravel Boost Tools

Available MCP tools for this project:

- `list-artisan-commands` - List Artisan commands
- `list-routes` - List application routes
- `search-docs` - Search Laravel documentation (version-specific)
- `tinker` - Execute PHP in Laravel context
- `database-query` - Execute read-only SQL queries
- `browser-logs` - Read browser console logs
- `application-info` - Get app info (PHP, Laravel, packages versions)

Use `search-docs` before implementing Laravel features to get version-specific guidance.
