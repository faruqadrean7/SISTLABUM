<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TestQueueJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public bool $shouldFail = false
    ) {}

    public function handle(): void
    {
        if ($this->shouldFail) {
            throw new \RuntimeException('Simulated queue failure for verification');
        }

        Log::info('TEST_QUEUE_JOB_SUCCESS: Job executed successfully on database driver');
    }
}
