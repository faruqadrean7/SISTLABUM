<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $rolesData = [
            ['name' => 'super_admin', 'display_name' => 'Super Administrator', 'description' => 'Akses penuh ke seluruh sistem'],
            ['name' => 'admin_tu', 'display_name' => 'Admin Tata Usaha', 'description' => 'Pengelolaan administrasi, siswa, staf, dan persuratan'],
            ['name' => 'principal', 'display_name' => 'Kepala Sekolah', 'description' => 'Akses eksekutif, persetujuan dan monitoring laporan'],
            ['name' => 'teacher', 'display_name' => 'Guru Mata Pelajaran', 'description' => 'Pengajaran, penilaian, jurnal, dan CBT'],
            ['name' => 'homeroom', 'display_name' => 'Wali Kelas', 'description' => 'Pengelolaan kelas, rekap nilai, rapor, dan karakter'],
            ['name' => 'counselor', 'display_name' => 'Guru BK (Bimbingan Konseling)', 'description' => 'Pencatatan konseling privat, poin, dan deteksi dini'],
            ['name' => 'facility_staff', 'display_name' => 'Staf Sarana & Prasarana', 'description' => 'Aset, booking fasilitas, dan tiket perbaikan'],
            ['name' => 'ppdb_committee', 'display_name' => 'Panitia PPDB', 'description' => 'Verifikasi berkas, seleksi, dan pendaftaran ulang PPDB'],
            ['name' => 'librarian', 'display_name' => 'Pustakawan', 'description' => 'Manajemen buku dan peminjaman perpustakaan'],
            ['name' => 'student', 'display_name' => 'Siswa', 'description' => 'Akses materi, jadwal, tugas, CBT, dan rapor'],
            ['name' => 'guardian', 'display_name' => 'Orang Tua / Wali Murid', 'description' => 'Monitoring kehadiran, nilai, dan tagihan anak'],
            ['name' => 'guest', 'display_name' => 'Tamu / Calon Siswa', 'description' => 'Pendaftaran PPDB, buku tamu digital, dan pengaduan'],
        ];

        $roleModels = [];
        foreach ($rolesData as $roleInfo) {
            $roleModels[$roleInfo['name']] = Role::firstOrCreate(
                ['name' => $roleInfo['name']],
                [
                    'display_name' => $roleInfo['display_name'],
                    'description' => $roleInfo['description'],
                    'is_system' => true,
                ]
            );
        }

        // 2. Core Permissions
        $permissionsData = [
            // Auth & Users
            ['name' => 'auth.user.read', 'module' => 'AUTH', 'description' => 'Melihat daftar pengguna'],
            ['name' => 'auth.user.write', 'module' => 'AUTH', 'description' => 'Mengelola akun pengguna'],
            ['name' => 'auth.role.manage', 'module' => 'AUTH', 'description' => 'Mengelola role dan permission'],

            // Master Data
            ['name' => 'master.academic_year.manage', 'module' => 'MST', 'description' => 'Mengelola tahun ajaran dan semester'],
            ['name' => 'master.student.read', 'module' => 'MST', 'description' => 'Melihat data siswa'],
            ['name' => 'master.student.write', 'module' => 'MST', 'description' => 'Mengubah data siswa'],
            ['name' => 'master.teacher.manage', 'module' => 'MST', 'description' => 'Mengelola data guru'],
            ['name' => 'master.class.manage', 'module' => 'MST', 'description' => 'Mengelola kelas dan rombel'],
            ['name' => 'master.subject.manage', 'module' => 'MST', 'description' => 'Mengelola mata pelajaran'],

            // PPDB
            ['name' => 'ppdb.wave.manage', 'module' => 'PPDB', 'description' => 'Mengelola gelombang dan jalur PPDB'],
            ['name' => 'ppdb.applicant.read', 'module' => 'PPDB', 'description' => 'Melihat pendaftar PPDB'],
            ['name' => 'ppdb.applicant.verify', 'module' => 'PPDB', 'description' => 'Verifikasi berkas pendaftar PPDB'],
            ['name' => 'ppdb.selection.run', 'module' => 'PPDB', 'description' => 'Menjalankan proses seleksi PPDB'],

            // Akademik & LMS
            ['name' => 'academic.schedule.manage', 'module' => 'ACD', 'description' => 'Mengelola jadwal pelajaran'],
            ['name' => 'academic.journal.write', 'module' => 'ACD', 'description' => 'Mengisi jurnal mengajar'],
            ['name' => 'academic.attendance.write', 'module' => 'ACD', 'description' => 'Mencatat presensi siswa'],
            ['name' => 'academic.grade.read', 'module' => 'ACD', 'description' => 'Melihat nilai'],
            ['name' => 'academic.grade.write', 'module' => 'ACD', 'description' => 'Menginput nilai'],
            ['name' => 'academic.report.generate', 'module' => 'ACD', 'description' => 'Mencetak rapor'],

            // CBT
            ['name' => 'cbt.bank.write', 'module' => 'CBT', 'description' => 'Mengelola bank soal'],
            ['name' => 'cbt.exam.manage', 'module' => 'CBT', 'description' => 'Mengelola jadwal dan sesi ujian CBT'],
            ['name' => 'cbt.proctor.action', 'module' => 'CBT', 'description' => 'Aksi pengawas ujian CBT'],
            ['name' => 'cbt.exam.take', 'module' => 'CBT', 'description' => 'Mengerjakan ujian CBT'],

            // Kesiswaan & BK
            ['name' => 'student.point.read', 'module' => 'STD', 'description' => 'Melihat poin pelanggaran/prestasi'],
            ['name' => 'student.point.write', 'module' => 'STD', 'description' => 'Mencatat poin pelanggaran/prestasi'],
            ['name' => 'counseling.case.read', 'module' => 'BK', 'description' => 'Melihat kasus konseling BK'],
            ['name' => 'counseling.case.write', 'module' => 'BK', 'description' => 'Mencatat sesi dan kasus konseling BK'],

            // Sarpras & Pustaka
            ['name' => 'facility.booking.manage', 'module' => 'SAR', 'description' => 'Menyetujui/menolak booking fasilitas'],
            ['name' => 'facility.asset.manage', 'module' => 'SAR', 'description' => 'Mengelola inventaris aset'],
            ['name' => 'library.book.manage', 'module' => 'SAR', 'description' => 'Mengelola buku dan peminjaman pustaka'],

            // CMS & Notifikasi
            ['name' => 'cms.post.manage', 'module' => 'CMS', 'description' => 'Mengelola artikel dan berita CMS'],
            ['name' => 'notification.broadcast', 'module' => 'NTF', 'description' => 'Kirim broadcast pengumuman'],
        ];

        $allPermissionIds = [];
        foreach ($permissionsData as $perm) {
            $p = Permission::firstOrCreate(
                ['name' => $perm['name']],
                [
                    'module' => $perm['module'],
                    'description' => $perm['description'],
                ]
            );
            $allPermissionIds[] = $p->id;
        }

        // Hubungkan super_admin dengan semua permission
        $roleModels['super_admin']->permissions()->sync($allPermissionIds);

        // 3. Initial Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@labschool.sch.id'],
            [
                'username' => 'superadmin',
                'password_hash' => Hash::make('Admin123!@#'),
                'name' => 'Super Administrator Sistem',
                'status' => 'ACTIVE',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        if (!$superAdmin->roles()->where('role_id', $roleModels['super_admin']->id)->exists()) {
            $superAdmin->roles()->attach($roleModels['super_admin']->id);
        }
    }
}
