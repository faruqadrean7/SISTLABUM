<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePermission
{
    use ApiResponse;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->errorResponse('Sesi tidak valid atau telah berakhir', 'UNAUTHENTICATED', 401);
        }

        // Check if user has permission or is super_admin
        $hasPermission = $user->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists() || $user->roles()->where('name', 'super_admin')->exists();

        if (!$hasPermission) {
            return $this->errorResponse('Anda tidak memiliki izin untuk mengakses resource ini', 'FORBIDDEN', 403);
        }

        return $next($request);
    }
}
