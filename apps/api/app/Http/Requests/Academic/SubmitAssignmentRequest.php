<?php

namespace App\Http\Requests\Academic;

use App\Http\Requests\BaseApiRequest;

class SubmitAssignmentRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'file' => ['required_without:file_id', 'file', 'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,jpg,jpeg,png', 'max:25600'],
            'file_id' => ['nullable', 'uuid', 'exists:files,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required_without' => 'Berkas pengerjaan tugas wajib diunggah',
            'file.mimes' => 'Format berkas pengumpulan harus berupa PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, atau Gambar',
            'file.max' => 'Ukuran berkas pengumpulan maksimal 25 MB',
            'file_id.exists' => 'Berkas berkas pengumpulan tidak ditemukan di sistem',
            'notes.max' => 'Catatan siswa maksimal 1000 karakter',
        ];
    }
}
