<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        \App\Models\Account::class => \App\Policies\AccountPolicy::class,
        \App\Models\Category::class => \App\Policies\CategoryPolicy::class,
        \App\Models\Transaction::class => \App\Policies\TransactionPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
