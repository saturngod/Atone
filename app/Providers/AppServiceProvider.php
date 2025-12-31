<?php

namespace App\Providers;

use App\Models\Transaction;
use App\Observers\TransactionObserver;
use App\Services\AnalyticsService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AnalyticsService::class, function () {
            return new AnalyticsService;
        });
    }

    public function boot(): void
    {
        $analyticsService = app(AnalyticsService::class);
        Transaction::observe(new TransactionObserver($analyticsService));
    }
}
