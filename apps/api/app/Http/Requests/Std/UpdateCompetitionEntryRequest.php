<?php

namespace App\Http\Requests\Std;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompetitionEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'result' => ['sometimes', 'required', 'string', 'max:100'],
            'achievement_id' => ['nullable', 'uuid', 'exists:achievements,id'],
            'coach_teacher_id' => ['nullable', 'uuid', 'exists:teachers,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
