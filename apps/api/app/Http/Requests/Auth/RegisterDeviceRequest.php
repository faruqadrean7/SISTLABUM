<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;

class RegisterDeviceRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'platform' => ['required', 'string', 'in:android,ios,web'],
            'fcm_token' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'platform.required' => 'Platform perangkat wajib dipilih',
            'platform.in' => 'Platform harus salah satu dari: android, ios, web',
            'fcm_token.required' => 'Token FCM perangkat wajib diisi',
            'fcm_token.max' => 'Token FCM maksimal 500 karakter',
        ];
    }
}
