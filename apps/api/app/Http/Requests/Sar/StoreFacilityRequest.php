<?php

namespace App\Http\Requests\Sar;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'facility_type' => ['required', 'string', 'in:ruang,alat'],
            'room_id' => ['nullable', 'uuid', 'exists:rooms,id'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'requires_approval' => ['nullable', 'boolean'],
        ];
    }
}
