# Personal Finance App - အသုံး

A Laravel + React personal finance application with AI-powered transaction management using OpenAI/Nemotron.

## Features

- **AI-Powered Transaction Creation**: Create transactions using natural language
- **Analytics Dashboard**: Track daily, monthly, and yearly spending by account and category
- **Category Management**: Organize transactions with custom categories
- **Account Tracking**: Manage multiple financial accounts

## Tech Stack

- **Backend**: Laravel 11, PHP 8.2+, SQLite (default) / MySQL / PostgreSQL
- **Frontend**: React 18, TypeScript, Inertia.js, Tailwind CSS v4
- **AI**: OpenAI API (GPT-4o, GPT-4o-mini) or NVIDIA Nemotron
- **Database**: SQLite (development), MySQL/PostgreSQL (production)

## Requirements

- PHP 8.2+
- Node.js 20+
- Composer 2+
- SQLite extension for PHP

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd personal-finance-app
composer install
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database Setup

```bash
php artisan migrate --seed
```

For SQLite (default):

- Ensure PHP has SQLite extension enabled
- The database file will be created at `database/database.sqlite`

For MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=personal_finance
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run Development Servers

```bash
# Terminal 1: Laravel server
npm run dev

# Terminal 2: Vite dev server
composer run dev
```

Or for production build:

```bash
npm run build
php artisan serve
```

## Environment Variables

### Application

```env
APP_NAME="Personal Finance"
APP_URL=http://localhost:8000
APP_ENV=local
```

### Database

```env
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_CONNECTION=pgsql
```

### Authentication

```env
# Enable/disable user registration
ALLOW_REGISTER=true
```

Set `ALLOW_REGISTER=false` to disable new user registration.

### OpenAI Integration

```env
# OpenAI Model (gpt-4o, gpt-4o-mini, gpt-4-turbo, etc.)
OPENAI_MODEL=gpt-4o

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-api-key-here

# OpenAI API URL
OPENAI_URL=https://api.openai.com/v1
```

**Note**: You can also use NVIDIA Nemotron or other OpenAI-compatible APIs by changing the `OPENAI_URL`.

Example for local LLM:

```env
OPENAI_MODEL=meta/llama-3.1-70b-instruct
OPENAI_URL=http://localhost:8000/v1
OPENAI_API_KEY=sk-local-key
```

### Session & Security

```env
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

## Project Structure

```
├── app/
│   ├── Actions/          # Laravel Fortify actions
│   ├── Console/          # Artisan commands
│   ├── Http/             # Controllers, middleware, requests
│   ├── Models/           # Eloquent models
│   ├── Observers/        # Model observers (TransactionObserver)
│   ├── Providers/        # Service providers
│   └── Services/         # Business logic (AnalyticsService, OpenAIService)
├── bootstrap/            # Application bootstrap
├── config/               # Configuration files
├── database/
│   ├── factories/        # Model factories
│   ├── migrations/       # Database migrations
│   └── seeders/          # Database seeders
├── resources/
│   ├── css/              # Stylesheets
│   └── js/               # React components, pages, hooks
├── routes/               # Route definitions
└── tests/                # Feature and unit tests
```

## Key Components

### Analytics Service (`app/Services/AnalyticsService.php`)

Handles automatic aggregation of transaction data:

- **Daily Analytics**: Tracks income/expense per user per day
- **Monthly Analytics**: Aggregates monthly totals
- **Yearly Analytics**: Year-long spending summaries
- **Account Analytics**: Per-account daily tracking
- **Category Analytics**: Per-category spending by day

Uses atomic `upsert()` operations to prevent race conditions.

### Transaction Observer (`app/Observers/TransactionObserver.php`)

Automatically updates analytics when transactions are created, updated, or deleted:

- `created`: Applies transaction to analytics
- `updated`: Reverts old values, applies new values
- `deleted`: Reverts transaction from analytics

### OpenAI Service (`app/Services/OpenAIService.php`)

Processes natural language to create transactions:

- Parses descriptions, amounts, dates from text
- Suggests categories for transactions
- Uses function calling for structured output

## API Endpoints

### Web Routes

| Method | URI                | Description        |
| ------ | ------------------ | ------------------ |
| GET    | /                  | Dashboard          |
| GET    | /accounts          | List accounts      |
| POST   | /accounts          | Create account     |
| PUT    | /accounts/{id}     | Update account     |
| DELETE | /accounts/{id}     | Delete account     |
| GET    | /categories        | List categories    |
| POST   | /categories        | Create category    |
| PUT    | /categories/{id}   | Update category    |
| DELETE | /categories/{id}   | Delete category    |
| GET    | /transactions      | List transactions  |
| POST   | /transactions      | Create transaction |
| PUT    | /transactions/{id} | Update transaction |
| DELETE | /transactions/{id} | Delete transaction |

## Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/TransactionTest.php

# Run with coverage
php artisan test --coverage
```

## Linting & Formatting

```bash
# PHP formatting
vendor/bin/pint --dirty

# JavaScript/TypeScript linting
npm run lint

# TypeScript type checking
npm run types
```

## Production Deployment

1. Set `APP_ENV=production`
2. Use MySQL or PostgreSQL
3. Set secure session domain
4. Configure proper cache and queue drivers
5. Run `npm run build`
6. Set `ALLOW_REGISTER=false` to disable public registration if needed

```env
APP_ENV=production
ALLOW_REGISTER=false
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is open-sourced software licensed under the MIT license.
