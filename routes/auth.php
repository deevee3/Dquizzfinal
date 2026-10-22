<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Requests\AuthKitAuthenticationRequest;
use Laravel\WorkOS\Http\Requests\AuthKitLoginRequest;
use Laravel\WorkOS\WorkOS;
use WorkOS\UserManagement;

Route::get('login', function () {
    return Inertia::render('auth/login');
})->middleware(['guest'])->name('login');

Route::post('login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ]);

    $user = User::where('email', $credentials['email'])->first();

    if (! $user || ! $user->password || ! Hash::check($credentials['password'], $user->password)) {
        throw ValidationException::withMessages([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    Auth::guard('web')->login($user, true);
    $request->session()->regenerate();

    return redirect()->intended(route('dashboard'));
})->middleware(['guest']);

Route::post('login/test', function (Request $request) {
    $user = User::where('email', 'test@dquizz.com')->first() ?? User::first();

    if ($user) {
        Auth::guard('web')->login($user, true);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->middleware(['guest'])->name('login.test');

Route::get('login/workos', function (AuthKitLoginRequest $request) {
    if ($request->getHost() === '127.0.0.1') {
        return redirect()->to('http://localhost:'.$request->getPort().'/login/workos');
    }

    return $request->redirect();
})->middleware(['guest'])->name('login.workos');

Route::get('authenticate', function (AuthKitAuthenticationRequest $request) {
    return tap(to_route('dashboard'), fn () => $request->authenticate(
        findUsing: fn (string $id) => User::where('workos_id', $id)->first()
            ?? (app()->environment('local') ? User::first() : null),
    ));
})->middleware(['guest']);

Route::post('logout', function () {
    $accessToken = session()->get('workos_access_token');

    $workOsSession = $accessToken
        ? WorkOS::decodeAccessToken($accessToken)
        : false;

    Auth::guard('web')->logout();

    session()->invalidate();
    session()->regenerateToken();

    if (! $workOsSession) {
        return redirect('/');
    }

    WorkOS::configure();

    $logoutUrl = (new UserManagement)->getLogoutUrl(
        $workOsSession['sid'],
        url('/'),
    );

    return inertia()->location($logoutUrl);
})->middleware(['auth'])->name('logout');
