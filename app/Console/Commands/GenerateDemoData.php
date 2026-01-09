<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Account;
use App\Models\Category;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class GenerateDemoData extends Command
{
    protected $signature = 'demo:generate
                            {--user= : User ID to generate data for (defaults to first user)}
                            {--months=6 : Number of months of data to generate}
                            {--transactions=300 : Approximate number of transactions to generate}';

    protected $description = 'Generate demo transaction data for the last N months (requires ALLOW_DEMO_SETUP=true)';

    /**
     * Demo account configurations
     *
     * @var array<array{name: string, color: string, currency_code: string}>
     */
    private array $demoAccounts = [
        ['name' => 'Checking Account', 'color' => '#3B82F6', 'currency_code' => 'USD'],
        ['name' => 'Savings Account', 'color' => '#10B981', 'currency_code' => 'USD'],
        ['name' => 'Credit Card', 'color' => '#EF4444', 'currency_code' => 'USD'],
        ['name' => 'Cash', 'color' => '#F59E0B', 'currency_code' => 'USD'],
    ];

    /**
     * Demo categories with typical transaction ranges
     *
     * @var array<array{name: string, min: int, max: int, type: string}>
     */
    private array $demoCategories = [
        ['name' => 'Groceries', 'min' => 20, 'max' => 150, 'type' => 'expense'],
        ['name' => 'Dining Out', 'min' => 10, 'max' => 80, 'type' => 'expense'],
        ['name' => 'Transportation', 'min' => 5, 'max' => 60, 'type' => 'expense'],
        ['name' => 'Entertainment', 'min' => 10, 'max' => 100, 'type' => 'expense'],
        ['name' => 'Shopping', 'min' => 20, 'max' => 200, 'type' => 'expense'],
        ['name' => 'Utilities', 'min' => 50, 'max' => 200, 'type' => 'expense'],
        ['name' => 'Healthcare', 'min' => 15, 'max' => 300, 'type' => 'expense'],
        ['name' => 'Subscriptions', 'min' => 5, 'max' => 50, 'type' => 'expense'],
        ['name' => 'Salary', 'min' => 3000, 'max' => 7000, 'type' => 'income'],
        ['name' => 'Freelance', 'min' => 200, 'max' => 2000, 'type' => 'income'],
        ['name' => 'Investments', 'min' => 50, 'max' => 500, 'type' => 'income'],
    ];

    /**
     * Demo merchants organized by category
     *
     * @var array<string, array<string>>
     */
    private array $demoMerchants = [
        'Groceries' => ['Whole Foods', 'Trader Joe\'s', 'Costco', 'Safeway', 'Kroger'],
        'Dining Out' => ['Starbucks', 'Chipotle', 'McDonald\'s', 'Olive Garden', 'Local Cafe'],
        'Transportation' => ['Shell Gas', 'Uber', 'Lyft', 'Metro Transit', 'Chevron'],
        'Entertainment' => ['Netflix', 'Spotify', 'AMC Theaters', 'Steam', 'Apple Music'],
        'Shopping' => ['Amazon', 'Target', 'Walmart', 'Best Buy', 'Nike'],
        'Utilities' => ['Electric Company', 'Water Utility', 'Internet Provider', 'Gas Company'],
        'Healthcare' => ['CVS Pharmacy', 'Walgreens', 'Local Clinic', 'Hospital'],
        'Subscriptions' => ['Netflix', 'Spotify', 'Adobe', 'Microsoft 365', 'Gym Membership'],
        'Salary' => ['Employer Inc.', 'Tech Corp', 'Company LLC'],
        'Freelance' => ['Client A', 'Client B', 'Upwork'],
        'Investments' => ['Dividend Payment', 'Stock Sale', 'Interest Payment'],
    ];

    public function handle(): int
    {
        if (! config('demo.allow_demo_setup')) {
            $this->error('Demo data generation is disabled. Set ALLOW_DEMO_SETUP=true in your .env file.');

            return Command::FAILURE;
        }

        $months = (int) $this->option('months');
        $transactionCount = (int) $this->option('transactions');

        // Get or find user
        $userId = $this->option('user');
        $user = $userId
            ? User::find($userId)
            : User::first();

        if (! $user) {
            $this->error('No user found. Please create a user first or specify a valid --user ID.');

            return Command::FAILURE;
        }

        $this->info("Generating demo data for user: {$user->name} ({$user->email})");
        $this->newLine();

        // Create accounts
        $this->info('Creating accounts...');
        $accounts = $this->createAccounts($user);
        $this->info("  ✓ Created {$accounts->count()} accounts");

        // Create categories
        $this->info('Creating categories...');
        $categories = $this->createCategories($user);
        $this->info("  ✓ Created {$categories->count()} categories");

        // Create merchants
        $this->info('Creating merchants...');
        $merchants = $this->createMerchants($user);
        $this->info("  ✓ Created {$merchants->count()} merchants");

        // Create transactions
        $this->info('Generating transactions...');
        $createdTransactions = $this->createTransactions(
            $user,
            $accounts,
            $categories,
            $merchants,
            $months,
            $transactionCount
        );
        $this->info("  ✓ Created {$createdTransactions} transactions");

        $this->newLine();
        $this->info('Demo data generation complete!');

        return Command::SUCCESS;
    }

    /**
     * Create demo accounts for the user
     *
     * @return Collection<int, Account>
     */
    private function createAccounts(User $user): Collection
    {
        $accounts = collect();

        foreach ($this->demoAccounts as $accountData) {
            $account = Account::firstOrCreate(
                ['user_id' => $user->id, 'name' => $accountData['name']],
                [
                    'color' => $accountData['color'],
                    'currency_code' => $accountData['currency_code'],
                ]
            );
            $accounts->push($account);
        }

        return $accounts;
    }

    /**
     * Create demo categories for the user
     *
     * @return Collection<int, Category>
     */
    private function createCategories(User $user): Collection
    {
        $categories = collect();

        foreach ($this->demoCategories as $categoryData) {
            $category = Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => $categoryData['name']]
            );
            $categories->put($categoryData['name'], [
                'model' => $category,
                'min' => $categoryData['min'],
                'max' => $categoryData['max'],
                'type' => $categoryData['type'],
            ]);
        }

        return $categories;
    }

    /**
     * Create demo merchants for the user
     *
     * @return Collection<string, Collection<int, Merchant>>
     */
    private function createMerchants(User $user): Collection
    {
        $merchants = collect();

        foreach ($this->demoMerchants as $category => $merchantNames) {
            $categoryMerchants = collect();
            foreach ($merchantNames as $merchantName) {
                $merchant = Merchant::firstOrCreate(
                    ['user_id' => $user->id, 'name' => $merchantName]
                );
                $categoryMerchants->push($merchant);
            }
            $merchants->put($category, $categoryMerchants);
        }

        return $merchants;
    }

    /**
     * Create demo transactions
     *
     * @param  Collection<int, Account>  $accounts
     * @param  Collection<string, array{model: Category, min: int, max: int, type: string}>  $categories
     * @param  Collection<string, Collection<int, Merchant>>  $merchants
     */
    private function createTransactions(
        User $user,
        Collection $accounts,
        Collection $categories,
        Collection $merchants,
        int $months,
        int $transactionCount
    ): int {
        $startDate = Carbon::today()->subMonths($months)->startOfMonth();
        $endDate = Carbon::today();

        $created = 0;
        $bar = $this->output->createProgressBar($transactionCount);
        $bar->start();

        // Distribute transactions across the date range
        $categoryKeys = $categories->keys()->toArray();

        for ($i = 0; $i < $transactionCount; $i++) {
            // Random date in range
            $daysRange = $startDate->diffInDays($endDate);
            $randomDays = rand(0, (int) $daysRange);
            $transactionDate = $startDate->copy()->addDays($randomDays);

            // Pick random category
            $categoryName = $categoryKeys[array_rand($categoryKeys)];
            $categoryData = $categories->get($categoryName);
            $category = $categoryData['model'];

            // Generate amount based on category range
            $amount = $this->generateAmount(
                $categoryData['min'],
                $categoryData['max'],
                $categoryData['type']
            );

            // Pick appropriate account (income goes to checking/savings, expenses come from any)
            $account = $categoryData['type'] === 'income'
                ? $accounts->whereIn('name', ['Checking Account', 'Savings Account'])->random()
                : $accounts->random();

            // Pick merchant for category
            $categoryMerchants = $merchants->get($categoryName, collect());
            $merchant = $categoryMerchants->isNotEmpty()
                ? $categoryMerchants->random()
                : null;

            // Generate description
            $description = $this->generateDescription($categoryName, $merchant, $categoryData['type']);

            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'category_id' => $category->id,
                'merchant_id' => $merchant?->id,
                'amount' => $amount,
                'description' => $description,
                'date' => $transactionDate->format('Y-m-d'),
            ]);

            $created++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        return $created;
    }

    /**
     * Generate a realistic amount within the given range
     */
    private function generateAmount(int $min, int $max, string $type): string
    {
        // Generate amount with cents
        $dollars = rand($min, $max);
        $cents = rand(0, 99);
        $amount = $dollars + ($cents / 100);

        // Negative for expenses, positive for income
        if ($type === 'expense') {
            $amount = -$amount;
        }

        return number_format($amount, 2, '.', '');
    }

    /**
     * Generate a realistic transaction description
     */
    private function generateDescription(?string $category, ?Merchant $merchant, string $type): string
    {
        if ($merchant) {
            return $merchant->name;
        }

        $descriptions = [
            'Groceries' => ['Weekly groceries', 'Grocery shopping', 'Food supplies'],
            'Dining Out' => ['Lunch', 'Dinner', 'Coffee', 'Breakfast'],
            'Transportation' => ['Gas', 'Uber ride', 'Bus fare', 'Parking'],
            'Entertainment' => ['Movie tickets', 'Concert', 'Games', 'Subscription'],
            'Shopping' => ['Online purchase', 'Clothing', 'Electronics', 'Home goods'],
            'Utilities' => ['Electric bill', 'Water bill', 'Internet bill', 'Gas bill'],
            'Healthcare' => ['Pharmacy', 'Doctor visit', 'Medicine', 'Health supplies'],
            'Subscriptions' => ['Monthly subscription', 'Service fee', 'Membership'],
            'Salary' => ['Monthly salary', 'Paycheck', 'Salary deposit'],
            'Freelance' => ['Freelance payment', 'Contract work', 'Consulting fee'],
            'Investments' => ['Dividend', 'Interest earned', 'Investment return'],
        ];

        $categoryDescriptions = $descriptions[$category] ?? ['Transaction'];

        return $categoryDescriptions[array_rand($categoryDescriptions)];
    }
}
