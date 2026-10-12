<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

trait ApiResponse
{
    /**
     * Standard Single/Collection Success Response:
     * { "data": { ... } } or { "data": [ ... ], "meta": { ... } }
     */
    protected function successResponse(mixed $data = null, int $status = 200, ?array $meta = null): JsonResponse
    {
        $response = ['data' => $data];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status, [
            'X-Request-Id' => request()->header('X-Request-Id', (string) Str::uuid()),
        ]);
    }

    /**
     * Standard Paginated Response:
     * { "data": [ ... ], "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 } }
     */
    protected function paginatedResponse(LengthAwarePaginator $paginator, int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'limit' => $paginator->perPage(),
                'total' => $paginator->total(),
                'totalPages' => $paginator->lastPage(),
            ],
        ], $status, [
            'X-Request-Id' => request()->header('X-Request-Id', (string) Str::uuid()),
        ]);
    }

    /**
     * Standard Error Response:
     * { "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [...], "requestId": "..." } }
     */
    protected function errorResponse(string $message, string $code = 'INTERNAL_ERROR', int $status = 500, array $details = []): JsonResponse
    {
        $requestId = request()->header('X-Request-Id', (string) Str::uuid());

        $error = [
            'code' => $code,
            'message' => $message,
            'details' => $details,
            'requestId' => $requestId,
        ];

        return response()->json(['error' => $error], $status, [
            'X-Request-Id' => $requestId,
        ]);
    }

    /**
     * Standard Not Found Response:
     * { "error": { "code": "NOT_FOUND", "message": "...", "details": [], "requestId": "..." } }
     */
    protected function notFoundResponse(string $message = 'Data tidak ditemukan.'): JsonResponse
    {
        return $this->errorResponse($message, 'NOT_FOUND', 404);
    }
}
