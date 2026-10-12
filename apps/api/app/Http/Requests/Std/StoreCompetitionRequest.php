<?php

namespace App\Http\Requests\Std;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompetitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'organizer' => ['nullable', 'string', 'max:150'],
            'level' => ['required', 'string', 'in:Kota,Kabupaten,Provinsi,Nasional,Internasional'],
            'category' => ['nullable', 'string', 'max:50'],
            'held_at' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
