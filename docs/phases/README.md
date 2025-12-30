# Development Phases - Personal Finance Tracker

## Overview

Granular, atomic phases for vibe coding with easy rollback capability.

## Phase Order

| #   | Phase                                                    | Status | Description                                              |
| --- | -------------------------------------------------------- | ------ | -------------------------------------------------------- |
| 01  | [Database Schema](./01-database-schema.md)               | ⏳     | Create migrations for accounts, categories, transactions |
| 02  | [Eloquent Models](./02-eloquent-models.md)               | ⏳     | Create models with relationships                         |
| 03  | [Database Factories](./03-database-factories.md)         | ⏳     | Create factories for testing                             |
| 04  | [Account Controller](./04-account-controller.md)         | ⏳     | CRUD controller with validation                          |
| 05  | [Account Routes](./05-account-routes.md)                 | ⏳     | Define web routes                                        |
| 06  | [Accounts Page](./06-accounts-page.md)                   | ⏳     | Index page with CRUD UI                                  |
| 07  | [Category Controller](./07-category-controller.md)       | ⏳     | CRUD controller with validation                          |
| 08  | [Category Routes](./08-category-routes.md)               | ⏳     | Define web routes                                        |
| 09  | [Categories Page](./09-categories-page.md)               | ⏳     | Index page with CRUD UI                                  |
| 10  | [Transaction Form](./10-transaction-form.md)             | ⏳     | Hero feature: fast entry with smart categories           |
| 11  | [Transaction List](./11-transaction-list.md)             | ⏳     | Table with sorting and grouping                          |
| 12  | [Transaction Controller](./12-transaction-controller.md) | ⏳     | CRUD with smart category creation                        |
| 13  | [Transaction Routes](./13-transaction-routes.md)         | ⏳     | Define web routes                                        |
| 14  | [Transactions Page](./14-transactions-page.md)           | ⏳     | Main page combining form and list                        |
| 15  | [Dashboard](./15-dashboard.md)                           | ⏳     | Balance overview and summaries                           |
| 16  | [Navigation & Layout](./16-navigation-layout.md)         | ⏳     | App layout with navigation                               |
| 17  | [Policies](./17-policies.md)                             | ⏳     | Authorization policies                                   |
| 18  | [Wayfinder](./18-wayfinder.md)                           | ⏳     | TypeScript route generation                              |
| 19  | [Feature Tests](./19-feature-tests.md)                   | ⏳     | Comprehensive tests                                      |
| 20  | [Polish & Mobile](./20-polish-mobile.md)                 | ⏳     | UI polish and responsive design                          |

## Rollback Strategy

### Before Starting a Phase

1. Note current git state: `git status`
2. Create backup branch (optional): `git branch backup-phase-XX`

### After Completing a Phase

1. Run tests: `php artisan test`
2. Run linter: `vendor/bin/pint --dirty`
3. Commit: `git add . && git commit -m "Phase XX: Description"`

### To Rollback a Phase

```bash
# Soft rollback (keep changes staged)
git reset --soft HEAD~1

# Hard rollback (discard changes)
git reset --hard HEAD~1

# Or rollback to backup branch
git checkout backup-phase-XX
```

## Quick Start

```bash
# Run all migrations
php artisan migrate

# Run a single phase's tests
php artisan test tests/Feature/AccountTest.php

# Generate Wayfinder types (after routes)
php artisan wayfinder:generate
```

## Dependencies Between Phases

```
01-db-schema
    ↓
02-eloquent-models
    ↓
03-factories
    ↓
04-account-controller → 05-account-routes → 06-accounts-page
    ↓
07-category-controller → 08-category-routes → 09-categories-page
    ↓
10-transaction-form
    ↓
11-transaction-list
    ↓
12-transaction-controller → 13-transaction-routes → 14-transactions-page
    ↓
15-dashboard
    ↓
16-navigation-layout
    ↓
17-policies (can be done anytime)
    ↓
18-wayfinder (after routes)
    ↓
19-feature-tests
    ↓
20-polish-mobile
```

## Estimated Time per Phase

- Backend (01-05, 07-08, 12-13, 17-18): ~15-30 min each
- Frontend (06, 09, 10-11, 14-16, 20): ~30-60 min each
- Tests (19): ~45-60 min
- Dashboard (15): ~30 min

## Total Estimated Time: ~8-10 hours
