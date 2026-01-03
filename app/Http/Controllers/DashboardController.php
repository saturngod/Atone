<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $currency = $request->input('currency') ?? $user->currency_code;

        $availableCurrencies = $user->accounts()
            ->select('currency_code')
            ->distinct()
            ->pluck('currency_code')
            ->push($user->currency_code)
            ->unique()
            ->values();

        return Inertia::render('Dashboard', [
            'currency' => $currency,
            'availableCurrencies' => $availableCurrencies,
            ...$this->dashboardService->getDashboardData($user, $currency),
        ]);
    }
}
