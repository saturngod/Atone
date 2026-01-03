# Gemini Context: Personal Finance App (SPF)

## Project Overview
**SPF (Simple Personal Finance)** is a minimalist, AI-powered personal finance tracker built with **Laravel 12** and **React 19** (via **Inertia.js**). It features natural language transaction entry, automated analytics, and a clean, responsive UI using **Tailwind CSS v4** and **Shadcn UI**.

### Key Technologies
*   **Backend:** PHP 8.2+, Laravel 12, SQLite (Dev) / MySQL/PostgreSQL (Prod).
*   **Frontend:** React 19, TypeScript, Inertia.js, Tailwind CSS v4, Radix UI / Shadcn.
*   **AI/ML:** OpenAI API integration (GPT-4o/mini) or NVIDIA Nemotron for parsing natural language transactions.
*   **Testing:** Pest (PHP), standard React testing tools.
*   **Tooling:** Vite, ESLint, Prettier, Laravel Pint, Husky.

## Architecture & Structure
*   **`app/Services/`**: Core business logic.
    *   `OpenAIService.php`: Handles LLM interactions for transaction parsing.
    *   `AnalyticsService.php`: Manages data aggregation (daily/monthly/yearly stats).
*   **`app/Observers/`**: Event-driven logic.
    *   `TransactionObserver.php`: Updates analytics automatically on transaction CRUD.
*   **`resources/js/`**: React frontend source.
    *   `pages/`: Inertia page components.
    *   `components/`: Reusable UI components (Shadcn based).
    *   `lib/`: Utilities and hooks.
*   **`docs/`**: Project documentation (PRD, phase guides).

## Development Workflow

### Startup
To run the full development environment (Laravel + Vite + Queue + Pail):
```bash
composer run dev
```
*Alternatively, run services individually:*
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

## Conventions & Standards
*   **Styling:** Utility-first with Tailwind CSS. Follow Shadcn UI patterns for components.
*   **Frontend:** Functional React components with Hooks. Strong typing with TypeScript.
*   **Backend:** Follow modern Laravel practices (Service pattern, skinny controllers, Form Requests).
*   **Commits:** Conventional Commits format (enforced by Commitlint/Husky).
    *   Example: `feat: add transaction export` or `fix: correct calculation error`.
*   **AI Integration:** Use `OpenAIService` for all LLM calls. Ensure prompts are stored/managed centrally if possible.

## Critical Files
*   `composer.json` / `package.json`: Dependency truth sources.
*   `docs/PRD.md`: Feature requirements and "Hero" feature definition.
*   `.env`: Configuration (OpenAI keys, DB connection).
*   `vite.config.ts`: Frontend build configuration.
