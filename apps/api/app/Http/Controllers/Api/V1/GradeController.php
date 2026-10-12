<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\BulkStoreGradeRequest;
use App\Http\Requests\Academic\StoreGradeRequest;
use App\Services\GradeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class GradeController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected GradeService $service
    ) {}

    /**
     * BE-GRD-01: Daftar nilai siswa.
     * GET /api/v1/grades
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $paginator = $this->service->listGrades($request->all(), $request);

            return $this->paginatedResponse($paginator);
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat mengambil daftar nilai', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-GRD-01: Input / perbarui nilai satuan.
     * POST /api/v1/grades
     */
    public function store(StoreGradeRequest $request): JsonResponse
    {
        try {
            $grade = $this->service->storeGrade($request->validated(), $request);

            return $this->successResponse($grade, 201);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                422 => 'BUSINESS_RULE_VIOLATION',
                403 => 'FORBIDDEN',
                default => 'BAD_REQUEST',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat menginput nilai', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-GRD-01: Input massal nilai satu kelas.
     * POST /api/v1/grades/bulk
     */
    public function bulk(BulkStoreGradeRequest $request): JsonResponse
    {
        try {
            $result = $this->service->bulkStoreGrades($request->validated(), $request);

            return $this->successResponse($result, 201);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                422 => 'BUSINESS_RULE_VIOLATION',
                403 => 'FORBIDDEN',
                default => 'BAD_REQUEST',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat menginput nilai massal', 'INTERNAL_ERROR', 500);
        }
    }
}
