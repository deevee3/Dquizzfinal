<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Requests\AuthKitAuthenticationRequest;
use Laravel\WorkOS\Http\Requests\AuthKitLoginRequest;
use Laravel\WorkOS\WorkOS;
use WorkOS\UserManagement;

Route::get('login', function (AuthKitLoginRequest $request) {
    return $request->redirect();
})->middleware(['guest'])->name('login');

Route::get('authenticate', function (AuthKitAuthenticationRequest $request) {
    return tap(to_route('dashboard'), fn () => $request->authenticate());
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
