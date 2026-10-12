<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\CheckInStaffAttendanceRequest;
use App\Http\Requests\Academic\CheckOutStaffAttendanceRequest;
use App\Http\Requests\Academic\ListStaffAttendanceRequest;
use App\Services\StaffAttendanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class StaffAttendanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected StaffAttendanceService $service
    ) {}

    /**
     * BE-ACD-05: Cek status presensi hari ini.
     * GET /api/v1/staff-attendances/today
     */
    public function today(Request $request): JsonResponse
    {
        try {
            $attendance = $this->service->getTodayAttendance($request);

            return $this->successResponse($attendance);
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat memeriksa status presensi hari ini', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-ACD-05: Check-in presensi staf.
     * POST /api/v1/staff-attendances/check-in
     */
    public function checkIn(CheckInStaffAttendanceRequest $request): JsonResponse
    {
        try {
            $attendance = $this->service->checkIn($request->validated(), $request);

            return $this->successResponse($attendance, 201);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                403 => 'FORBIDDEN',
                422 => 'BUSINESS_RULE_VIOLATION',
                default => 'BAD_REQUEST',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat memproses check-in presensi', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-ACD-05: Check-out presensi staf.
     * POST /api/v1/staff-attendances/check-out
     */
    public function checkOut(CheckOutStaffAttendanceRequest $request): JsonResponse
    {
        try {
            $attendance = $this->service->checkOut($request->validated(), $request);

            return $this->successResponse($attendance);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                403 => 'FORBIDDEN',
                422 => 'BUSINESS_RULE_VIOLATION',
                default => 'BAD_REQUEST',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat memproses check-out presensi', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-ACD-05: Daftar riwayat presensi staf.
     * GET /api/v1/staff-attendances
     */
    public function index(ListStaffAttendanceRequest $request): JsonResponse
    {
        try {
            $paginator = $this->service->listAttendances($request->validated(), $request);

            return $this->paginatedResponse($paginator);
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat mengambil riwayat presensi staf', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-ACD-05: Rekap dan persentase kehadiran staf untuk dashboard.
     * GET /api/v1/staff-attendances/summary
     */
    public function summary(Request $request): JsonResponse
    {
        try {
            $summary = $this->service->getSummary($request->all(), $request);

            return $this->successResponse($summary);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                403 => 'FORBIDDEN',
                default => 'BAD_REQUEST',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Terjadi kesalahan saat mengambil ringkasan presensi staf', 'INTERNAL_ERROR', 500);
        }
    }
}
