<?php

use App\Http\Middleware\RequirePermission;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'permission' => RequirePermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $renderError = function (string $message, string $code, int $status, array $details = []) {
            $requestId = request()->header('X-Request-Id', (string) Str::uuid());

            return response()->json([
                'error' => [
                    'code' => $code,
                    'message' => $message,
                    'details' => $details,
                    'requestId' => $requestId,
                ],
            ], $status, ['X-Request-Id' => $requestId]);
        };

        $exceptions->render(function (AuthenticationException $e, Request $request) use ($renderError) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $renderError('Sesi tidak valid atau telah berakhir', 'UNAUTHENTICATED', 401);
            }
        });

        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $e, Request $request) use ($renderError) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $renderError('Anda tidak memiliki izin untuk tindakan ini', 'FORBIDDEN', 403);
            }
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e, Request $request) use ($renderError) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $renderError('Data tidak ditemukan', 'NOT_FOUND', 404);
            }
        });

        $exceptions->render(function (UniqueConstraintViolationException $e, Request $request) use ($renderError) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $renderError('Data duplikat atau terjadi konflik data', 'CONFLICT', 409);
            }
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) use ($renderError) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $renderError('Terlalu banyak permintaan, coba lagi nanti', 'RATE_LIMITED', 429);
            }
        });

        $exceptions->render(function (Throwable $e, Request $request) use ($renderError) {
            if (($request->is('api/*') || $request->expectsJson()) && ! config('app.debug')) {
                return $renderError('Terjadi kesalahan internal server', 'INTERNAL_SERVER_ERROR', 500);
            }
        });
    })->create();
