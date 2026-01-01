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
        return Inertia::render('Dashboard', $this->dashboardService->getDashboardData($request->user()));
    }
}
