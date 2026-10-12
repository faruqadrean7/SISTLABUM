<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ProductionExceptionHandlerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Route::get('/api/v1/test-error-simulation', function () {
            throw new \RuntimeException('Database host credentials leaked in failure: secret_password');
        });
    }

    public function test_production_exception_handler_sanitizes_500_errors(): void
    {
        config(['app.debug' => false]);

        $response = $this->getJson('/api/v1/test-error-simulation');

        $response->assertStatus(500)
            ->assertHeader('X-Request-Id')
            ->assertJsonPath('error.code', 'INTERNAL_SERVER_ERROR')
            ->assertJsonPath('error.message', 'Terjadi kesalahan internal server');

        $content = $response->getContent();
        $this->assertStringNotContainsString('secret_password', $content);
        $this->assertStringNotContainsString('RuntimeException', $content);
    }
}
