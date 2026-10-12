<?php

namespace App\Services\Ntf;

use App\Models\AuditLog;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class NotificationPreferenceService
{
    /**
     * BE-NTF-04: Ambil seluruh konfigurasi preferensi notifikasi milik user.
     * Menggabungkan data tersimpan di DB dengan nilai default katalog jika belum pernah diatur.
     */
    public function getUserPreferences(User $user): array
    {
        $existingRecords = NotificationPreference::where('user_id', $user->id)
            ->get()
            ->keyBy('notif_type');

        $result = [];
        foreach (NotificationPreference::NOTIFICATION_TYPES as $type => $meta) {
            $pref = $existingRecords->get($type);

            $result[] = [
                'notif_type' => $type,
                'label' => $meta['label'],
                'description' => $meta['description'],
                'supported_channels' => $meta['supported_channels'],
                'is_enabled' => $pref ? (bool) $pref->is_enabled : true,
                'channel_push' => $pref ? (bool) $pref->channel_push : true,
                'channel_wa' => $pref ? (bool) $pref->channel_wa : true,
                'channel_email' => $pref ? (bool) $pref->channel_email : true,
            ];
        }

        return $result;
    }

    /**
     * BE-NTF-04: Perbarui preferensi notifikasi user (single atau batch).
     */
    public function updateUserPreferences(User $user, array $data, Request $request): array
    {
        $itemsToUpdate = [];

        if (! empty($data['preferences']) && is_array($data['preferences'])) {
            $itemsToUpdate = $data['preferences'];
        } elseif (! empty($data['notif_type'])) {
            $itemsToUpdate = [$data];
        }

        if (empty($itemsToUpdate)) {
            throw new HttpException(422, 'Tidak ada data preferensi notifikasi yang dikirimkan.');
        }

        foreach ($itemsToUpdate as $item) {
            $type = $item['notif_type'];

            $updatePayload = [];
            if (array_key_exists('is_enabled', $item)) {
                $updatePayload['is_enabled'] = (bool) $item['is_enabled'];
            }
            if (array_key_exists('channel_push', $item)) {
                $updatePayload['channel_push'] = (bool) $item['channel_push'];
            }
            if (array_key_exists('channel_wa', $item)) {
                $updatePayload['channel_wa'] = (bool) $item['channel_wa'];
            }
            if (array_key_exists('channel_email', $item)) {
                $updatePayload['channel_email'] = (bool) $item['channel_email'];
            }

            NotificationPreference::updateOrCreate(
                ['user_id' => $user->id, 'notif_type' => $type],
                $updatePayload
            );
        }

        $this->logAudit($user->id, 'notification_preference.update', 'notification_preferences', null, null, [
            'updated_types' => collect($itemsToUpdate)->pluck('notif_type')->toArray(),
        ], $request);

        return $this->getUserPreferences($user);
    }

    /**
     * BE-NTF-04: Katalog jenis notifikasi yang tersedia dan kanal yang didukung.
     */
    public function getCatalog(): array
    {
        $catalog = [];
        foreach (NotificationPreference::NOTIFICATION_TYPES as $type => $info) {
            $catalog[] = [
                'type' => $type,
                'label' => $info['label'],
                'description' => $info['description'],
                'supported_channels' => $info['supported_channels'],
            ];
        }

        return $catalog;
    }

    protected function logAudit(?string $actorId, string $action, string $entity, ?string $entityId, ?array $oldValue, ?array $newValue, Request $request): void
    {
        try {
            AuditLog::create([
                'actor_id' => $actorId,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId,
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Jangan gagalkan transaksi bila audit gagal
        }
    }
}
