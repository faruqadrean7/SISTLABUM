<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\ExamSession;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExamAutoSubmitCommand extends Command
{
    protected $signature = 'exam:auto-submit';

    protected $description = 'Submit otomatis sesi ujian CBT yang melewati batas waktu deadline pengerjaan';

    public function handle(): int
    {
        $now = Carbon::now();

        $expiredSessions = ExamSession::whereIn('status', ['mengerjakan', 'in_progress'])
            ->where('deadline_at', '<=', $now)
            ->get();

        $count = 0;
        foreach ($expiredSessions as $session) {
            $session->update([
                'status' => 'selesai',
                'submitted_at' => $session->deadline_at ?? $now,
            ]);
            $count++;

            AuditLog::create([
                'action' => 'EXAM_SESSION_AUTO_SUBMITTED',
                'entity' => 'exam_sessions',
                'entity_id' => $session->id,
                'new_value' => [
                    'status' => 'selesai',
                    'submitted_at' => ($session->deadline_at ?? $now)->toIso8601String(),
                ],
            ]);
        }

        $this->info("Berhasil mengumpulkan otomatis {$count} sesi ujian CBT yang melewati batas waktu.");

        return Command::SUCCESS;
    }
}
