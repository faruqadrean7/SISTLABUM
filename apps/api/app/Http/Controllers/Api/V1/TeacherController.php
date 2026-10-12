<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\ImportTeachersRequest;
use App\Http\Requests\Master\StoreTeacherRequest;
use App\Http\Requests\Master\UpdateTeacherRequest;
use App\Services\TeacherStaffService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class TeacherController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected TeacherStaffService $teacherStaffService
    ) {}

    /**
     * BE-MST-03: List Teachers
     * GET /api/v1/teachers
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $teachers = $this->teacherStaffService->listTeachers($request);

            return $this->paginatedResponse($teachers);
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Gagal mengambil daftar guru', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-MST-03: Import Teachers from CSV
     * POST /api/v1/teachers/import
     */
    public function import(ImportTeachersRequest $request): JsonResponse
    {
        try {
            $result = $this->teacherStaffService->importTeachers($request->file('file'), $request);

            if (! $result['success']) {
                return $this->errorResponse(
                    'Validasi baris import guru gagal. Harap perbaiki baris yang bermasalah.',
                    'VALIDATION_FAILED',
                    400,
                    $result['errors']
                );
            }

            return $this->successResponse($result, 201);
        } catch (HttpException $e) {
            return $this->errorResponse($e->getMessage(), 'BUSINESS_RULE_VIOLATION', $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Gagal mengimpor data guru', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-MST-03: Create Teacher
     * POST /api/v1/teachers
     */
    public function store(StoreTeacherRequest $request): JsonResponse
    {
        try {
            $teacher = $this->teacherStaffService->createTeacher($request->validated(), $request);

            return $this->successResponse($teacher, 201);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                400 => 'BUSINESS_RULE_VIOLATION',
                409 => 'CONFLICT',
                default => 'INTERNAL_ERROR',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Gagal menambahkan guru baru', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-MST-03: Show Teacher Detail
     * GET /api/v1/teachers/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            $teacher = $this->teacherStaffService->getTeacher($id);

            return $this->successResponse($teacher);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Guru tidak ditemukan', 'NOT_FOUND', 404);
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Gagal mengambil data guru', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-MST-03: Update Teacher
     * PUT /api/v1/teachers/{id}
     */
    public function update(UpdateTeacherRequest $request, string $id): JsonResponse
    {
        try {
            $teacher = $this->teacherStaffService->updateTeacher($id, $request->validated(), $request);

            return $this->successResponse($teacher);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Guru tidak ditemukan', 'NOT_FOUND', 404);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                400 => 'BUSINESS_RULE_VIOLATION',
                409 => 'CONFLICT',
                default => 'INTERNAL_ERROR',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Gagal memperbarui data guru', 'INTERNAL_ERROR', 500);
        }
    }

    /**
     * BE-MST-03: Delete Teacher
     * DELETE /api/v1/teachers/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $this->teacherStaffService->deleteTeacher($id, $request);

            return $this->successResponse(['message' => 'Data guru berhasil dihapus']);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Guru tidak ditemukan', 'NOT_FOUND', 404);
        } catch (HttpException $e) {
            $code = match ($e->getStatusCode()) {
                400 => 'BUSINESS_RULE_VIOLATION',
                409 => 'CONFLICT',
                default => 'INTERNAL_ERROR',
            };

            return $this->errorResponse($e->getMessage(), $code, $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            return $this->errorResponse('Gagal menghapus data guru', 'INTERNAL_ERROR', 500);
        }
    }
}
