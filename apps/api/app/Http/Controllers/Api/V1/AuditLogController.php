<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * BE-AUTH-05: List Audit Logs (Paginated & Filterable)
     * GET /api/v1/audit-logs
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $logs = $this->auditLogService->list($request);

            return $this->paginatedResponse($logs);
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Gagal mengambil data log audit', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-AUTH-05: Get Audit Log Detail
     * GET /api/v1/audit-logs/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            $log = $this->auditLogService->find($id);

            return $this->successResponse($log);
        } catch (Throwable $e) {
            return $this->errorResponse('Data log audit tidak ditemukan', 'NOT_FOUND', 404);
        }
    }
}
