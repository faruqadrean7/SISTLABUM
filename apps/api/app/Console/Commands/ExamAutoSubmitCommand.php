<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\ExamSession;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExamAutoSubmitCommand extends Command
{
    protected $signature = 'exam:auto-submit {--grace-seconds= : Toleransi waktu keterlambatan dalam detik}';

    protected $aliases = ['cbt:close-expired-sessions'];

    protected $description = 'Submit otomatis sesi ujian CBT yang melewati batas waktu deadline pengerjaan';

    public function handle(): int
    {
        $now = Carbon::now();
        $graceSeconds = (int) ($this->option('grace-seconds') ?? config('cbt.grace_period_seconds', 5));
        $cutoff = $now->copy()->subSeconds($graceSeconds);

        $expiredSessions = ExamSession::whereIn('status', ['mengerjakan', 'in_progress'])
            ->where(function ($query) use ($cutoff) {
                $query->where(function ($q) use ($cutoff) {
                    $q->whereNotNull('ends_at')
                        ->where('ends_at', '<=', $cutoff);
                })->orWhere(function ($q) use ($cutoff) {
                    $q->whereNull('ends_at')
                        ->whereNotNull('deadline_at')
                        ->where('deadline_at', '<=', $cutoff);
                });
            })
            ->get();

        $count = 0;
        foreach ($expiredSessions as $session) {
            $effectiveDeadline = $session->ends_at ?? $session->deadline_at ?? $now;

            $session->update([
                'status' => 'selesai',
                'submitted_at' => $effectiveDeadline,
            ]);
            $count++;

            AuditLog::create([
                'action' => 'EXAM_SESSION_AUTO_SUBMITTED',
                'entity' => 'exam_sessions',
                'entity_id' => $session->id,
                'new_value' => [
                    'status' => 'selesai',
                    'submitted_at' => $effectiveDeadline->toIso8601String(),
                ],
            ]);
        }

        $this->info("Berhasil mengumpulkan otomatis {$count} sesi ujian CBT yang melewati batas waktu.");

        return Command::SUCCESS;
    }
}
