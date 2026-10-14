export interface GuardianChildProfile {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  class_name: string;
  grade_level: string;
  homeroom_teacher: string;
  homeroom_phone: string;
  initials: string;
  gender: 'L' | 'P';
  gate_attendance_today: {
    status: 'hadir' | 'terlambat' | 'sakit' | 'izin' | 'alpa';
    tap_time: string;
    location: string;
    note: string;
  };
  attendance_recap: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    terlambat: number;
    rate: number;
  };
  grade_average: number;
  points_balance: number;
  points_prestasi: number;
  points_pelanggaran: number;
  admin_fee_status: 'Lunas / Bebas Tanggungan' | 'Menunggu Verifikasi TU';
}

export interface GuardianProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  children: GuardianChildProfile[];
}

export const CURRENT_GUARDIAN: GuardianProfile = {
  id: 'grd-001',
  name: 'H. Ir. Bambang Maulana',
  phone: '0812-3456-7890',
  email: 'bambang.maulana@gmail.com',
  address: 'Jl. Ijen No. 42, Klojen, Kota Malang',
  occupation: 'Konsultan Enjiniring & Wiraswasta',
  children: [
    {
      id: 'std-240901',
      name: 'Ahmad Fauzan Maulana',
      nis: '240901',
      nisn: '0089123451',
      class_name: 'Kelas IX-A',
      grade_level: 'Tingkat IX (Sembilan)',
      homeroom_teacher: 'Dra. Hj. Siti Aminah, M.Pd.',
      homeroom_phone: '0813-3456-7891',
      initials: 'AF',
      gender: 'L',
      gate_attendance_today: {
        status: 'hadir',
        tap_time: '06:48 WIB',
        location: 'Gerbang Utama RFID Siswa (Gate 1)',
        note: 'Tepat waktu, berseragam batik resmi Labschool lengkap',
      },
      attendance_recap: {
        hadir: 68,
        sakit: 1,
        izin: 1,
        alpa: 0,
        terlambat: 1,
        rate: 97.2,
      },
      grade_average: 89.9,
      points_balance: 45,
      points_prestasi: 55,
      points_pelanggaran: 10,
      admin_fee_status: 'Lunas / Bebas Tanggungan',
    },
    {
      id: 'std-260715',
      name: 'Nabila Putri Andini',
      nis: '260715',
      nisn: '0098765432',
      class_name: 'Kelas VII-B',
      grade_level: 'Tingkat VII (Tujuh)',
      homeroom_teacher: 'Drs. Hendra Wijaya, M.Pd.',
      homeroom_phone: '0813-3456-7892',
      initials: 'NA',
      gender: 'P',
      gate_attendance_today: {
        status: 'hadir',
        tap_time: '06:55 WIB',
        location: 'Gerbang Utama RFID Siswa (Gate 2)',
        note: 'Tepat waktu, berseragam putih-biru lengkap berikat pinggang standar',
      },
      attendance_recap: {
        hadir: 70,
        sakit: 0,
        izin: 0,
        alpa: 0,
        terlambat: 0,
        rate: 100.0,
      },
      grade_average: 92.4,
      points_balance: 60,
      points_prestasi: 60,
      points_pelanggaran: 0,
      admin_fee_status: 'Lunas / Bebas Tanggungan',
    },
  ],
};

// ─── PRESENSI & LOG GERBANG BULANAN ──────────────────────────
export interface AttendanceCalendarDay {
  date: string;
  day_number: number;
  day_name: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa' | 'terlambat' | 'libur';
  tap_in?: string;
  tap_out?: string;
  note?: string;
}

export const MOCK_GUARDIAN_ATTENDANCE: Record<string, AttendanceCalendarDay[]> = {
  'std-240901': [
    { date: '2026-10-01', day_number: 1, day_name: 'Kamis', status: 'hadir', tap_in: '06:45 WIB', tap_out: '15:10 WIB' },
    { date: '2026-10-02', day_number: 2, day_name: 'Jumat', status: 'hadir', tap_in: '06:50 WIB', tap_out: '11:45 WIB' },
    { date: '2026-10-03', day_number: 3, day_name: 'Sabtu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-04', day_number: 4, day_name: 'Minggu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-05', day_number: 5, day_name: 'Senin', status: 'hadir', tap_in: '06:42 WIB', tap_out: '15:15 WIB' },
    { date: '2026-10-06', day_number: 6, day_name: 'Selasa', status: 'terlambat', tap_in: '07:12 WIB', tap_out: '15:10 WIB', note: 'Terlambat 12 menit - Macet hujan deras' },
    { date: '2026-10-07', day_number: 7, day_name: 'Rabu', status: 'hadir', tap_in: '06:46 WIB', tap_out: '15:10 WIB' },
    { date: '2026-10-08', day_number: 8, day_name: 'Kamis', status: 'hadir', tap_in: '06:40 WIB', tap_out: '15:20 WIB', note: 'Dispensasi Lomba OSN Informatika' },
    { date: '2026-10-09', day_number: 9, day_name: 'Jumat', status: 'hadir', tap_in: '06:52 WIB', tap_out: '11:40 WIB' },
    { date: '2026-10-10', day_number: 10, day_name: 'Sabtu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-11', day_number: 11, day_name: 'Minggu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-12', day_number: 12, day_name: 'Senin', status: 'hadir', tap_in: '06:44 WIB', tap_out: '15:15 WIB' },
    { date: '2026-10-13', day_number: 13, day_name: 'Selasa', status: 'sakit', note: 'Demam flu - Surat dokter RS Lavalette terlampir' },
    { date: '2026-10-14', day_number: 14, day_name: 'Rabu', status: 'hadir', tap_in: '06:48 WIB', tap_out: 'Dalam KBM', note: 'Hari ini aktif mengikuti Sumatif STS' },
  ],
  'std-260715': [
    { date: '2026-10-01', day_number: 1, day_name: 'Kamis', status: 'hadir', tap_in: '06:50 WIB', tap_out: '15:05 WIB' },
    { date: '2026-10-02', day_number: 2, day_name: 'Jumat', status: 'hadir', tap_in: '06:48 WIB', tap_out: '11:40 WIB' },
    { date: '2026-10-03', day_number: 3, day_name: 'Sabtu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-04', day_number: 4, day_name: 'Minggu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-05', day_number: 5, day_name: 'Senin', status: 'hadir', tap_in: '06:45 WIB', tap_out: '15:05 WIB' },
    { date: '2026-10-06', day_number: 6, day_name: 'Selasa', status: 'hadir', tap_in: '06:49 WIB', tap_out: '15:10 WIB' },
    { date: '2026-10-07', day_number: 7, day_name: 'Rabu', status: 'hadir', tap_in: '06:52 WIB', tap_out: '15:05 WIB' },
    { date: '2026-10-08', day_number: 8, day_name: 'Kamis', status: 'hadir', tap_in: '06:48 WIB', tap_out: '15:05 WIB' },
    { date: '2026-10-09', day_number: 9, day_name: 'Jumat', status: 'hadir', tap_in: '06:51 WIB', tap_out: '11:40 WIB' },
    { date: '2026-10-10', day_number: 10, day_name: 'Sabtu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-11', day_number: 11, day_name: 'Minggu', status: 'libur', note: 'Libur Akhir Pekan' },
    { date: '2026-10-12', day_number: 12, day_name: 'Senin', status: 'hadir', tap_in: '06:46 WIB', tap_out: '15:10 WIB' },
    { date: '2026-10-13', day_number: 13, day_name: 'Selasa', status: 'hadir', tap_in: '06:50 WIB', tap_out: '15:05 WIB' },
    { date: '2026-10-14', day_number: 14, day_name: 'Rabu', status: 'hadir', tap_in: '06:55 WIB', tap_out: 'Dalam KBM', note: 'Hari ini aktif KBM' },
  ],
};

// ─── RIWAYAT PENGAJUAN SURAT IZIN / SAKIT ───────────────────
export interface LeaveRequestItem {
  id: string;
  student_id: string;
  student_name: string;
  leave_type: 'sakit' | 'izin';
  start_date: string;
  end_date: string;
  reason: string;
  attachment_name?: string;
  status: 'disetujui' | 'menunggu' | 'ditolak';
  submitted_at: string;
  approved_by?: string;
  approval_note?: string;
}

export const MOCK_LEAVE_REQUESTS: LeaveRequestItem[] = [
  {
    id: 'lr-2026-001',
    student_id: 'std-240901',
    student_name: 'Ahmad Fauzan Maulana',
    leave_type: 'sakit',
    start_date: '13 Oktober 2026',
    end_date: '13 Oktober 2026',
    reason: 'Mengalami demam tinggi dan radang tenggorokan, diistirahatkan sesuai anjuran dokter RS Lavalette.',
    attachment_name: 'Surat_Keterangan_Dokter_Lavalette_Fauzan.pdf',
    status: 'disetujui',
    submitted_at: '13 Okt 2026, 06:15 WIB',
    approved_by: 'Dra. Hj. Siti Aminah, M.Pd. (Wali Kelas IX-A)',
    approval_note: 'Disetujui. Semoga lekas sembuh, materi pelajaran hari ini dapat diakses via portal.',
  },
  {
    id: 'lr-2026-002',
    student_id: 'std-240901',
    student_name: 'Ahmad Fauzan Maulana',
    leave_type: 'izin',
    start_date: '18 September 2026',
    end_date: '18 September 2026',
    reason: 'Menghadiri prosesi wisuda sarjana kakak kandung di Graha Cakrawala Universitas Negeri Malang.',
    attachment_name: 'Surat_Permohonan_Izin_Keluarga_Bambang.pdf',
    status: 'disetujui',
    submitted_at: '16 Sep 2026, 19:30 WIB',
    approved_by: 'Dra. Hj. Siti Aminah, M.Pd. (Wali Kelas IX-A)',
    approval_note: 'Izin keluarga disetujui.',
  },
  {
    id: 'lr-2026-003',
    student_id: 'std-260715',
    student_name: 'Nabila Putri Andini',
    leave_type: 'izin',
    start_date: '18 September 2026',
    end_date: '18 September 2026',
    reason: 'Menghadiri prosesi wisuda sarjana kakak kandung di Graha Cakrawala UM bersama orang tua.',
    attachment_name: 'Surat_Permohonan_Izin_Keluarga_Bambang.pdf',
    status: 'disetujui',
    submitted_at: '16 Sep 2026, 19:30 WIB',
    approved_by: 'Drs. Hendra Wijaya, M.Pd. (Wali Kelas VII-B)',
    approval_note: 'Disetujui untuk izin acara keluarga.',
  },
];

// ─── CAPAIAN NILAI & RAPOR ANAK ─────────────────────────────
export interface ChildSubjectGrade {
  subject_code: string;
  subject_name: string;
  teacher_name: string;
  kktp: number;
  formative_avg: number;
  summative_avg: number;
  sts_score: number;
  final_score: number;
  predicate: 'A' | 'B+' | 'B' | 'C';
  status: 'Tuntas' | 'Perlu Pendampingan';
  competency_desc: string;
}

export const MOCK_CHILD_GRADES: Record<string, ChildSubjectGrade[]> = {
  'std-240901': [
    {
      subject_code: 'INF-09',
      subject_name: 'Informatika & Pemrograman Web',
      teacher_name: 'Budi Santoso, S.Kom., M.T.',
      kktp: 75,
      formative_avg: 93.7,
      summative_avg: 91.0,
      sts_score: 96,
      final_score: 93.5,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Sangat mahir merancang logika algoritma, CSS responsif, dan pemodelan database.',
    },
    {
      subject_code: 'MAT-09',
      subject_name: 'Matematika Terapan',
      teacher_name: 'Dra. Siti Rahayu, M.Pd.',
      kktp: 75,
      formative_avg: 85.7,
      summative_avg: 86.0,
      sts_score: 88,
      final_score: 86.4,
      predicate: 'B+',
      status: 'Tuntas',
      competency_desc: 'Menunjukkan pemahaman yang sangat baik dalam materi statistika dan fungsi kuadrat.',
    },
    {
      subject_code: 'IPA-09',
      subject_name: 'Ilmu Pengetahuan Alam (IPA)',
      teacher_name: 'Dr. Hendra Wijaya, M.Si.',
      kktp: 75,
      formative_avg: 86.3,
      summative_avg: 87.0,
      sts_score: 90,
      final_score: 87.5,
      predicate: 'B+',
      status: 'Tuntas',
      competency_desc: 'Memahami konsep kelistrikan dinamis serta aktif dalam praktikum sains terpadu.',
    },
    {
      subject_code: 'ENG-09',
      subject_name: 'Bahasa Inggris',
      teacher_name: 'Nurul Hidayati, M.Ed.',
      kktp: 75,
      formative_avg: 90.0,
      summative_avg: 89.0,
      sts_score: 91,
      final_score: 90.1,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Sangat aktif berkomunikasi lisan dalam diskusi kelompok berbahasa Inggris.',
    },
    {
      subject_code: 'BIN-09',
      subject_name: 'Bahasa Indonesia',
      teacher_name: 'Agus Subekti, S.Pd.',
      kktp: 75,
      formative_avg: 86.3,
      summative_avg: 87.0,
      sts_score: 89,
      final_score: 87.2,
      predicate: 'B+',
      status: 'Tuntas',
      competency_desc: 'Mampu menyusun teks laporan hasil observasi dengan struktur kebahasaan baku.',
    },
    {
      subject_code: 'PKN-09',
      subject_name: 'Pendidikan Pancasila & PKn',
      teacher_name: 'Wahyu Hidayat, S.Pd.',
      kktp: 75,
      formative_avg: 91.0,
      summative_avg: 88.0,
      sts_score: 92,
      final_score: 90.7,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Menunjukkan pengamalan nilai-nilai musyawarah mufakat dan toleransi di kelas.',
    },
    {
      subject_code: 'PAB-09',
      subject_name: 'Pendidikan Agama Islam',
      teacher_name: 'Ust. M. Ridwan, M.Ag.',
      kktp: 75,
      formative_avg: 95.0,
      summative_avg: 92.0,
      sts_score: 95,
      final_score: 94.3,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Sangat taat dalam ketepatan waktu ibadah salat zuhur berjamaah di masjid sekolah.',
    },
  ],
  'std-260715': [
    {
      subject_code: 'MAT-07',
      subject_name: 'Matematika Dasar',
      teacher_name: 'Rahmat Subagyo, M.Pd.',
      kktp: 75,
      formative_avg: 94.0,
      summative_avg: 92.5,
      sts_score: 95,
      final_score: 93.8,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Sangat menguasai operasi bilangan bulat, pecahan, dan aljabar dasar.',
    },
    {
      subject_code: 'IPA-07',
      subject_name: 'Ilmu Pengetahuan Alam (IPA)',
      teacher_name: 'Dra. Endang Lestari',
      kktp: 75,
      formative_avg: 92.0,
      summative_avg: 91.0,
      sts_score: 94,
      final_score: 92.3,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Sangat teliti dalam pengamatan mikroskop dan klasifikasi makhluk hidup.',
    },
    {
      subject_code: 'ENG-07',
      subject_name: 'Bahasa Inggris',
      teacher_name: 'Nurul Hidayati, M.Ed.',
      kktp: 75,
      formative_avg: 91.5,
      summative_avg: 90.0,
      sts_score: 92,
      final_score: 91.2,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Menunjukkan kosakata deskriptif yang sangat luas dan pelafalan akurat.',
    },
    {
      subject_code: 'BIN-07',
      subject_name: 'Bahasa Indonesia',
      teacher_name: 'Sri Wahyuni, S.Pd.',
      kktp: 75,
      formative_avg: 93.0,
      summative_avg: 92.0,
      sts_score: 93,
      final_score: 92.7,
      predicate: 'A',
      status: 'Tuntas',
      competency_desc: 'Mampu menulis puisi dan cerita fantasi dengan daya imajinasi tinggi.',
    },
  ],
};

// ─── POIN KARAKTER & KEDISIPLINAN ───────────────────────────
export interface ChildPointItem {
  id: string;
  student_id: string;
  point_date: string;
  kind: 'prestasi' | 'pelanggaran';
  title: string;
  category: string;
  points: number;
  recorder_name: string;
  note: string;
}

export const MOCK_CHILD_POINTS: Record<string, ChildPointItem[]> = {
  'std-240901': [
    {
      id: 'pt-01',
      student_id: 'std-240901',
      point_date: '08 Oktober 2026',
      kind: 'prestasi',
      title: 'Juara 1 Lomba OSN Informatika Tingkat Kota Malang',
      category: 'Prestasi Akademik Sains & Teknologi',
      points: 30,
      recorder_name: 'Budi Santoso, S.Kom., M.T.',
      note: 'Membawa medali emas untuk sekolah, mewakili ke seleksi provinsi Jatim.',
    },
    {
      id: 'pt-02',
      student_id: 'std-240901',
      point_date: '22 September 2026',
      kind: 'prestasi',
      title: 'Juara 2 Lomba Inovasi Desain Web Nasional Siswa',
      category: 'Prestasi Talenta & Kejuruan',
      points: 25,
      recorder_name: 'Budi Santoso, S.Kom., M.T.',
      note: 'Aplikasi prototipe portal edukasi ramah anak.',
    },
    {
      id: 'pt-03',
      student_id: 'std-240901',
      point_date: '15 September 2026',
      kind: 'pelanggaran',
      title: 'Keterlambatan Masuk Gerbang Sekolah (>10 Menit)',
      category: 'Kedisiplinan Waktu',
      points: -10,
      recorder_name: 'Petugas Piket Gerbang Utama',
      note: 'Terjebak kemacetan hujan deras, telah dicatat dan diberikan pembinaan motivasi pagi.',
    },
  ],
  'std-260715': [
    {
      id: 'pt-04',
      student_id: 'std-260715',
      point_date: '02 Oktober 2026',
      kind: 'prestasi',
      title: 'Juara 1 Lomba Story Telling Bahasa Inggris Tingkat SMP/MTs',
      category: 'Prestasi Bahasa & Seni',
      points: 35,
      recorder_name: 'Nurul Hidayati, M.Ed.',
      note: 'Penampilan memukau bertema cerita rakyat nusantara dalam bahasa Inggris.',
    },
    {
      id: 'pt-05',
      student_id: 'std-260715',
      point_date: '25 September 2026',
      kind: 'prestasi',
      title: 'Aktif Sebagai Petugas Upacara Hari Kesaktian Pancasila',
      category: 'Karakter & Kepemimpinan',
      points: 25,
      recorder_name: 'Drs. Hendra Wijaya, M.Pd.',
      note: 'Menjalankan tugas pembacaan UUD 1945 dengan khidmat dan disiplin.',
    },
  ],
};

// ─── INFORMASI BIAYA & ADMINISTRASI TU (INFORMATIF NON-PAYMENT) ─
export interface SchoolFeeItem {
  id: string;
  student_id: string;
  item_name: string;
  period_label: string;
  nominal_text: string;
  status: 'Lunas / Bebas Tanggungan' | 'Dalam Proses Administrasi TU';
  verified_date: string;
  receipt_number: string;
  cashier_name: string;
  notes: string;
}

export const MOCK_GUARDIAN_FEES: Record<string, SchoolFeeItem[]> = {
  'std-240901': [
    {
      id: 'fee-01',
      student_id: 'std-240901',
      item_name: 'SPP & Biaya Operasional Pembelajaran (BOP) - Oktober 2026',
      period_label: 'Bulan Oktober 2026',
      nominal_text: 'Rp 650.000',
      status: 'Lunas / Bebas Tanggungan',
      verified_date: '02 Okt 2026',
      receipt_number: 'KW-TU/2026/10/0189',
      cashier_name: 'Siti Rohmah (Bag. Keuangan TU)',
      notes: 'Pembayaran rutin bulanan terverifikasi lunas.',
    },
    {
      id: 'fee-02',
      student_id: 'std-240901',
      item_name: 'SPP & Biaya Operasional Pembelajaran (BOP) - September 2026',
      period_label: 'Bulan September 2026',
      nominal_text: 'Rp 650.000',
      status: 'Lunas / Bebas Tanggungan',
      verified_date: '03 Sep 2026',
      receipt_number: 'KW-TU/2026/09/0142',
      cashier_name: 'Siti Rohmah (Bag. Keuangan TU)',
      notes: 'Pembayaran rutin bulanan terverifikasi lunas.',
    },
    {
      id: 'fee-03',
      student_id: 'std-240901',
      item_name: 'Iuran Praktikum Lab Komputer & Lisensi Ujian CBT Semester Gasal',
      period_label: 'T.A. 2026/2027 Gasal',
      nominal_text: 'Rp 350.000',
      status: 'Lunas / Bebas Tanggungan',
      verified_date: '20 Jul 2026',
      receipt_number: 'KW-TU/2026/07/0055',
      cashier_name: 'Ahmad Muzakki (Kasir TU)',
      notes: 'Bebas tanggungan praktikum teknologi & lisensi software.',
    },
  ],
  'std-260715': [
    {
      id: 'fee-04',
      student_id: 'std-260715',
      item_name: 'SPP & Biaya Operasional Pembelajaran (BOP) - Oktober 2026',
      period_label: 'Bulan Oktober 2026',
      nominal_text: 'Rp 650.000',
      status: 'Lunas / Bebas Tanggungan',
      verified_date: '02 Okt 2026',
      receipt_number: 'KW-TU/2026/10/0190',
      cashier_name: 'Siti Rohmah (Bag. Keuangan TU)',
      notes: 'Pembayaran rutin bulanan terverifikasi lunas.',
    },
    {
      id: 'fee-05',
      student_id: 'std-260715',
      item_name: 'Iuran Masa Pengenalan Lingkungan Sekolah (MPLS) & Atribut Resmi',
      period_label: 'T.A. 2026/2027',
      nominal_text: 'Rp 450.000',
      status: 'Lunas / Bebas Tanggungan',
      verified_date: '15 Jul 2026',
      receipt_number: 'KW-TU/2026/07/0012',
      cashier_name: 'Ahmad Muzakki (Kasir TU)',
      notes: 'Seragam batik, rompi, topi, dasi, dan kartu RFID siswa lunas.',
    },
  ],
};

// ─── JANJI TEMU KONSELING & PERTEMUAN WALAS ─────────────────
export interface GuardianCounselingItem {
  id: string;
  student_id: string;
  student_name: string;
  topic: string;
  target_role: 'Wali Kelas' | 'Guru BK';
  target_name: string;
  requested_date: string;
  status: 'menunggu' | 'terjadwal' | 'selesai';
  location: string;
  notes: string;
}

export const MOCK_GUARDIAN_COUNSELING: GuardianCounselingItem[] = [
  {
    id: 'g-csl-01',
    student_id: 'std-240901',
    student_name: 'Ahmad Fauzan Maulana',
    topic: 'Diskusi Pemilihan Jalur Peminatan Lanjutan SMA & Prestasi OSN',
    target_role: 'Guru BK',
    target_name: 'Ibu Ratna Dewi, S.Pd., Kons. (Koordinator BK)',
    requested_date: 'Jumat, 16 Oktober 2026 - 13:30 WIB',
    status: 'terjadwal',
    location: 'Ruang Konseling & Pertemuan Ortu (Gedung Utama Lt. 2)',
    notes: 'Konsultasi tindak lanjut hasil psikotes minat bakat dan jadwal pembinaan olimpiade tingkat provinsi.',
  },
  {
    id: 'g-csl-02',
    student_id: 'std-260715',
    student_name: 'Nabila Putri Andini',
    topic: 'Evaluasi Adaptasi Belajar Siswa Baru & Program Bilingual',
    target_role: 'Wali Kelas',
    target_name: 'Drs. Hendra Wijaya, M.Pd. (Wali Kelas VII-B)',
    requested_date: 'Senin, 05 Oktober 2026 - 10:00 WIB',
    status: 'selesai',
    location: 'Ruang Guru Gedung B',
    notes: 'Pertemuan berjalan lancar. Ananda Nabila sangat proaktif, bersosialisasi baik, dan berprestasi membanggakan.',
  },
];

// ─── AGENDA & PENGUMUMAN WALI MURID ─────────────────────────
export interface GuardianAnnouncement {
  id: string;
  title: string;
  date_str: string;
  category: 'Pertemuan Komite' | 'Akademik' | 'Administrasi';
  content: string;
  badge_color: string;
  is_pinned?: boolean;
}

export const MOCK_GUARDIAN_ANNOUNCEMENTS: GuardianAnnouncement[] = [
  {
    id: 'ann-g-01',
    title: 'Undangan Rapat Pleno Komite Sekolah & Pembagian E-Progress Report Gasal',
    date_str: '14 Oktober 2026',
    category: 'Pertemuan Komite',
    content: 'Diberitahukan kepada seluruh orang tua/wali murid Kelas VII, VIII, dan IX bahwa Rapat Pleno Semester Gasal akan diselenggarakan pada Sabtu, 24 Oktober 2026 pukul 08:30 WIB di Graha Pancasila Labschool UM.',
    badge_color: 'bg-blue-900 text-white',
    is_pinned: true,
  },
  {
    id: 'ann-g-02',
    title: 'Penerbitan Surat Keterangan Nilai Sumatif Tengah Semester (STS) Gasal',
    date_str: '12 Oktober 2026',
    category: 'Akademik',
    content: 'Dokumen E-Progress Report bulanan dapat diunduh secara mandiri melalui menu "Capaian Nilai & Rapor" pada portal wali murid ini, dilengkapi tanda tangan digital dan QR code keaslian resmi.',
    badge_color: 'bg-emerald-700 text-white',
  },
  {
    id: 'ann-g-03',
    title: 'Layanan Pengajuan Surat Izin & Sakit Siswa Berbasis Digital',
    date_str: '01 Oktober 2026',
    category: 'Administrasi',
    content: 'Wali murid kini dapat mengunggah surat keterangan sakit atau permohonan izin langsung dari portal tanpa perlu menyerahkan surat fisik ke meja piket gerbang.',
    badge_color: 'bg-amber-600 text-white',
  },
];
