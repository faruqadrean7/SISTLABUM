<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class AuditLogService
{
    /**
     * BE-AUTH-05: List audit logs with comprehensive filtering and pagination.
     */
    public function list(Request $request): LengthAwarePaginator
    {
        $limit = min($request->integer('limit', 20), 100);

        $query = AuditLog::with(['actor:id,username,email'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->query('actor_id'));
        }

        if ($request->filled('action')) {
            $action = trim((string) $request->query('action'));
            if (str_contains($action, '*')) {
                $prefix = rtrim($action, '*');
                $query->where('action', 'like', "{$prefix}%");
            } else {
                $query->where('action', $action);
            }
        }

        if ($request->filled('entity')) {
            $query->where('entity', trim((string) $request->query('entity')));
        }

        if ($request->filled('entity_id')) {
            $query->where('entity_id', trim((string) $request->query('entity_id')));
        }

        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->query('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->query('end_date'));
        }

        if ($request->filled('q')) {
            $q = trim((string) $request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('action', 'like', "%{$q}%")
                    ->orWhere('entity', 'like', "%{$q}%")
                    ->orWhere('ip', 'like', "%{$q}%")
                    ->orWhereHas('actor', function ($actorQuery) use ($q) {
                        $actorQuery->where('username', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%");
                    });
            });
        }

        return $query->paginate($limit);
    }

    /**
     * BE-AUTH-05: Get single audit log detail by ID.
     */
    public function find(string $id): AuditLog
    {
        return AuditLog::with(['actor:id,username,email'])
            ->findOrFail($id);
    }
}
