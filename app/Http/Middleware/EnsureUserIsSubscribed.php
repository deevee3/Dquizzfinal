<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSubscribed
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Super admins bypass the subscription requirement
        if ($user?->isSuperAdmin()) {
            return $next($request);
        }

        if (! $user?->subscribed('default')) {
            return redirect()->route('billing.subscribe');
        }

        return $next($request);
    }
}
