<?php

namespace App\Http\Requests\Cbt;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_id' => ['nullable', 'uuid', 'exists:question_banks,id'],
            'question_type' => ['nullable', 'string', 'in:pg,pg_kompleks,bs,menjodohkan,isian,uraian'],
            'body' => ['nullable', 'array'],
            'body.content' => ['required_with:body', 'string'],
            'body.formula' => ['nullable', 'string'],
            'body.media_url' => ['nullable', 'string'],
            'cp_code' => ['nullable', 'string', 'max:100'],
            'cognitive_level' => ['nullable', 'string', 'in:LOTS,MOTS,HOTS'],
            'difficulty' => ['nullable', 'integer', 'min:1', 'max:5'],
            'weight' => ['nullable', 'numeric', 'min:0.1', 'max:100'],
            'explanation' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,aktif,terkunci'],
            'options' => ['nullable', 'array'],
            'options.*.label' => ['required_with:options', 'string', 'max:10'],
            'options.*.body' => ['required_with:options', 'array'],
            'options.*.is_correct' => ['nullable', 'boolean'],
            'options.*.match_key' => ['nullable', 'string', 'max:100'],
        ];
    }
}
