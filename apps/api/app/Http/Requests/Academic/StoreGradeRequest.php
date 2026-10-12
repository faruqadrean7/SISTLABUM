<?php

namespace App\Http\Requests\Academic;

use App\Http\Requests\BaseApiRequest;

class StoreGradeRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'component_id' => ['required', 'uuid', 'exists:grade_components,id'],
            'period_id' => ['required', 'uuid', 'exists:grade_periods,id'],
            'value' => ['required', 'numeric', 'between:0,100'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required' => 'Siswa wajib dipilih',
            'student_id.exists' => 'Siswa tidak ditemukan di sistem',
            'component_id.required' => 'Komponen nilai wajib dipilih',
            'component_id.exists' => 'Komponen nilai tidak ditemukan di sistem',
            'period_id.required' => 'Periode penilaian wajib dipilih',
            'period_id.exists' => 'Periode penilaian tidak ditemukan di sistem',
            'value.required' => 'Nilai wajib diisi',
            'value.numeric' => 'Nilai harus berupa angka',
            'value.between' => 'Nilai harus berada dalam rentang 0 sampai 100',
        ];
    }
}
