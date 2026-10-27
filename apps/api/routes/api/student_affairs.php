<?php

use App\Http\Controllers\Api\V1\Std\AchievementController;
use App\Http\Controllers\Api\V1\Std\CompetitionController;
use App\Http\Controllers\Api\V1\Std\ExtracurricularController;
use App\Http\Controllers\Api\V1\Std\PointTypeController;
use App\Http\Controllers\Api\V1\Std\StudentPointController;
use App\Http\Controllers\Api\V1\Std\TripController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // =====================================================================
    // BE-STD-01: Kesiswaan - Poin Pelanggaran & Prestasi
    // =====================================================================
    // Master Jenis Poin
    Route::get('/point-types', [PointTypeController::class, 'indexTypes'])
        ->middleware('permission:student.point.read');
    Route::post('/point-types', [PointTypeController::class, 'storeType'])
        ->middleware('permission:student.point.write');
    Route::get('/point-types/{id}', [PointTypeController::class, 'showType'])
        ->middleware('permission:student.point.read');
    Route::put('/point-types/{id}', [PointTypeController::class, 'updateType'])
        ->middleware('permission:student.point.write');
    Route::delete('/point-types/{id}', [PointTypeController::class, 'destroyType'])
        ->middleware('permission:student.point.write');

    // Master Ambang Batas Poin / Sanksi
    Route::get('/point-thresholds', [PointTypeController::class, 'indexThresholds'])
        ->middleware('permission:student.point.read');
    Route::post('/point-thresholds', [PointTypeController::class, 'storeThreshold'])
        ->middleware('permission:student.point.write');
    Route::get('/point-thresholds/{id}', [PointTypeController::class, 'showThreshold'])
        ->middleware('permission:student.point.read');
    Route::put('/point-thresholds/{id}', [PointTypeController::class, 'updateThreshold'])
        ->middleware('permission:student.point.write');
    Route::delete('/point-thresholds/{id}', [PointTypeController::class, 'destroyThreshold'])
        ->middleware('permission:student.point.write');

    // Pencatatan Poin Siswa
    Route::get('/student-points', [StudentPointController::class, 'index']);
    Route::post('/student-points', [StudentPointController::class, 'store']);
    Route::get('/student-points/{id}', [StudentPointController::class, 'show']);
    Route::delete('/student-points/{id}', [StudentPointController::class, 'destroy']);

    // Ringkasan Poin Siswa
    Route::get('/students/{id}/points/summary', [StudentPointController::class, 'summary']);

    // =====================================================================
    // BE-STD-02: Kesiswaan - Ekstrakurikuler & OSIS
    // =====================================================================
    // Ekstrakurikuler
    Route::get('/extracurriculars', [ExtracurricularController::class, 'index']);
    Route::post('/extracurriculars', [ExtracurricularController::class, 'store']);
    Route::get('/extracurriculars/{id}', [ExtracurricularController::class, 'show']);
    Route::put('/extracurriculars/{id}', [ExtracurricularController::class, 'update']);
    Route::delete('/extracurriculars/{id}', [ExtracurricularController::class, 'destroy']);

    // Anggota Ekstrakurikuler (Pendaftaran & Penilaian)
    Route::get('/extracurricular-members', [ExtracurricularController::class, 'indexMembers']);
    Route::post('/extracurricular-members', [ExtracurricularController::class, 'registerMember']);
    Route::put('/extracurricular-members/{id}', [ExtracurricularController::class, 'updateMember']);
    Route::delete('/extracurricular-members/{id}', [ExtracurricularController::class, 'removeMember']);

    // Jurnal Kegiatan & Presensi
    Route::get('/extracurricular-journals', [ExtracurricularController::class, 'indexJournals']);
    Route::post('/extracurricular-journals', [ExtracurricularController::class, 'storeJournal']);
    Route::get('/extracurricular-journals/{id}', [ExtracurricularController::class, 'showJournal']);
    Route::delete('/extracurricular-journals/{id}', [ExtracurricularController::class, 'destroyJournal']);

    // Dokumen Kegiatan / Proposal / Laporan (OSIS & Ekskul)
    Route::get('/activity-documents', [ExtracurricularController::class, 'indexDocuments']);
    Route::post('/activity-documents', [ExtracurricularController::class, 'storeDocument']);
    Route::get('/activity-documents/{id}', [ExtracurricularController::class, 'showDocument']);
    Route::delete('/activity-documents/{id}', [ExtracurricularController::class, 'destroyDocument']);

    // =====================================================================
    // BE-STD-03: Kesiswaan - Lomba & Prestasi
    // =====================================================================
    // Kompetisi & Delegasi Lomba
    Route::get('/competitions', [CompetitionController::class, 'index']);
    Route::get('/competitions/summary', [CompetitionController::class, 'summary']);
    Route::post('/competitions', [CompetitionController::class, 'store']);
    Route::get('/competitions/{id}', [CompetitionController::class, 'show']);
    Route::put('/competitions/{id}', [CompetitionController::class, 'update']);
    Route::delete('/competitions/{id}', [CompetitionController::class, 'destroy']);

    Route::get('/competitions/{id}/entries', [CompetitionController::class, 'indexEntries']);
    Route::post('/competitions/{id}/entries', [CompetitionController::class, 'storeEntry']);
    Route::put('/competition-entries/{id}', [CompetitionController::class, 'updateEntry']);
    Route::delete('/competition-entries/{id}', [CompetitionController::class, 'destroyEntry']);

    // Prestasi & Galeri Piala
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::post('/achievements', [AchievementController::class, 'store']);
    Route::get('/achievements/{id}', [AchievementController::class, 'show']);
    Route::put('/achievements/{id}', [AchievementController::class, 'update']);
    Route::patch('/achievements/{id}/verify', [AchievementController::class, 'verify']);
    Route::delete('/achievements/{id}', [AchievementController::class, 'destroy']);

    // =====================================================================
    // BE-STD-04: Kesiswaan - Study Trip & Outing Class
    // =====================================================================
    // Master Perjalanan (Trips)
    Route::get('/trips', [TripController::class, 'index']);
    Route::post('/trips', [TripController::class, 'store']);
    Route::get('/trips/{id}', [TripController::class, 'show']);
    Route::put('/trips/{id}', [TripController::class, 'update']);
    Route::delete('/trips/{id}', [TripController::class, 'destroy']);

    // Peserta Perjalanan (Participants)
    Route::get('/trips/{id}/participants', [TripController::class, 'indexParticipants']);
    Route::post('/trips/{id}/participants', [TripController::class, 'storeParticipant']);
    Route::delete('/trip-participants/{id}', [TripController::class, 'destroyParticipant']);

    // Izin Digital Orang Tua (Parental Consents)
    Route::get('/trips/{id}/consents', [TripController::class, 'indexConsents']);
    Route::post('/trips/{id}/consents', [TripController::class, 'storeConsent']);
});
