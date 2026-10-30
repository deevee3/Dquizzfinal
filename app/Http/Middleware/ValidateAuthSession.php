<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;
use Symfony\Component\HttpFoundation\Response;

/**
 * Validates WorkOS sessions in every environment. The only exception is a
 * session created by the native password login, which has no WorkOS token
 * to validate.
 */
class ValidateAuthSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->get('auth_via') === 'password') {
            return $next($request);
        }

        return app(ValidateSessionWithWorkOS::class)->handle($request, $next);
    }
}
