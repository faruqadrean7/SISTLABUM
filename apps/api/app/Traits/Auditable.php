<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            static::recordAuditLog($model, 'created', null, $model->toArray());
        });

        static::updated(function (Model $model) {
            $old = array_intersect_key($model->getOriginal(), $model->getDirty());
            $new = $model->getDirty();
            static::recordAuditLog($model, 'updated', $old, $new);
        });

        static::deleted(function (Model $model) {
            static::recordAuditLog($model, 'deleted', $model->toArray(), null);
        });
    }

    protected static function recordAuditLog(Model $model, string $action, ?array $oldValue, ?array $newValue): void
    {
        // Hindari infinite loop jika model adalah AuditLog itu sendiri
        if ($model instanceof AuditLog) {
            return;
        }

        try {
            AuditLog::create([
                'school_id' => $model->school_id ?? null,
                'actor_id' => Auth::id(),
                'action' => $action,
                'entity' => class_basename($model),
                'entity_id' => $model->getKey(),
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Jangan menghentikan transaksi bisnis jika audit log gagal sementara
            report($e);
        }
    }
}
