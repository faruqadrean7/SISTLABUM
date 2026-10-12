<?php

namespace App\Http\Requests\Sar;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:200'],
            'room_id' => ['nullable', 'uuid', 'exists:rooms,id'],
            'asset_id' => ['nullable', 'uuid', 'exists:assets,id'],
            'description' => ['required', 'string', 'max:2000'],
            'priority' => ['nullable', 'string', 'in:rendah,sedang,tinggi,darurat'],
            'photo_file_id' => ['nullable', 'uuid', 'exists:files,id'],
        ];
    }
}
