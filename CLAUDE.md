# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SPF (အသုံး) is a Laravel 12 + React 19 personal finance application with AI-powered transaction management. Users can create transactions through natural language using OpenAI/Nemotron AI, and view analytics dashboards with pre-aggregated data for performance.

**Tech Stack:** Laravel 12 (PHP 8.2+), React 19, TypeScript, Inertia.js, Tailwind CSS v4, SQLite/MySQL/PostgreSQL, Pest testing

## Development Commands

```bash
# Full development environment (runs PHP server, queue, logs, and Vite together)
composer run dev

# Development with SSR enabled
composer run dev:ssr

# Initial setup (install deps, migrate, build)
composer run setup

# Testing
php artisan test                              # All tests
php artisan test tests/Feature/AccountTest.php  # Specific file
php artisan test --filter=testName           # By test name
npm run types                                # TypeScript type checking

# Linting & Formatting
vendor/bin/pint --dirty    # Format PHP code
npm run lint               # Lint and fix JS/TS
npm run format             # Format JS/TS
npm run format:check       # Check formatting without fixing

# Build
npm run dev                # Vite dev server only
npm run build              # Production build
```

## Architecture

### Backend: Service Layer with Observer Pattern

The application uses a service layer for business logic and observers for side effects:

- **`app/Services/AnalyticsService.php`**: Handles automatic aggregation of transaction data into pre-computed analytics tables (Daily, Monthly, Yearly, AccountDaily, CategoryDaily). Uses atomic `upsert()` operations to prevent race conditions.

- **`app/Services/OpenAIService.php`**: Processes natural language input to create transactions. Uses OpenAI function calling to extract structured data (description, amount, date, category). Supports both OpenAI (GPT-4o, GPT-4o-mini) and NVIDIA Nemotron via configurable API URL.

- **`app/Observers/TransactionObserver.php`**: Automatically updates analytics when transactions change. On `created` applies transaction values; on `updated` reverts old then applies new; on `deleted` reverts values.

### Frontend: Inertia.js with React Pages

Pages are Inertia.js shared components in `resources/js/pages/`. The component hierarchy is:
- **Layouts** (`AuthenticatedLayout`, `GuestLayout`)
- **Pages** (Dashboard, Accounts, Categories, Transactions)
- **Feature components** (AccountForm, CategoryForm, TransactionForm)
- **UI components** (`resources/js/components/ui/` - Radix UI + Tailwind)

### Database Schema

Core entities: Users, Accounts, Categories, Transactions
Analytics tables: Daily, Monthly, Yearly, AccountDaily, CategoryDaily (pre-aggregated for dashboard performance)

All models use Eloquent with explicit return type hints. Relationships are eager-loaded to prevent N+1 queries.

## AI Integration Configuration

The app supports OpenAI-compatible APIs via `.env`:

```env
OPENAI_MODEL=gpt-4o
OPENAI_API_KEY=sk-your-key
OPENAI_URL=https://api.openai.com/v1  # Or alternative like NVIDIA Nemotron
```

The AI suggests categories and parses natural language into structured transaction data using function calling.

## Code Style

### PHP/Laravel
- Use `declare(strict_types=1);` at top of files
- Constructor property promotion for dependency injection
- Explicit return types on all methods
- Create Form Request classes for validation (not inline `validate()`)
- Use `Model::query()` over raw `DB::` queries
- Only use `env()` in config files; use `config()` elsewhere

### TypeScript/React
- Import order: CSS → vendor libraries → app imports
- Use `cn()` helper for Tailwind class merging
- Use Inertia `<Link>` for navigation, `<Form>` for forms
- Use `axios` for API calls (handles CSRF automatically)
- Always verify route files are complete after writing (check TypeScript types pass)

### Tailwind CSS v4
- Use `@import "tailwindcss"` (not `@tailwind` directives)
- Use `bg-black/50` syntax (not `bg-opacity-50`)
- Use `gap-*` utilities for spacing
