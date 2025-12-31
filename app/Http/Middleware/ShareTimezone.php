<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShareTimezone
{
    public function handle(Request $request, Closure $next)
    {
        Inertia::share('timezone', fn () => $request->user()?->timezone ?? 'UTC');

        return $next($request);
    }
}
