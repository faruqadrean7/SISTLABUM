<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_api_v1_health_returns_ok_with_database_and_redis(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'services' => [
                    'database' => 'ok',
                    'redis' => 'ok',
                ],
                'version' => '1.1.0',
            ]);
    }
}
