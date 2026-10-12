<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;

class LockReportCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_locked' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'is_locked.required' => 'Status penguncian (is_locked) wajib diisi.',
            'is_locked.boolean' => 'Format is_locked harus bernilai true atau false.',
            'reason.max' => 'Alasan kunci/buka kunci maksimal 255 karakter.',
        ];
    }
}
