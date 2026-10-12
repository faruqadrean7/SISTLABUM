# SISTLABUM — Web Portal Design Prototype

Prototipe antarmuka terpadu (HTML5, CSS3, Vanilla JS) untuk **SMP-SMA Laboratorium Universitas Negeri Malang (SISTLABUM)**, ditenagai backend ringan native Node.js dengan database relasional **SQLite**.

Prototipe ini dirancang dengan standar enterprise UI/UX non-generik: tipografi akademik (*Plus Jakarta Sans* & *JetBrains Mono*), palet warna institusional (Navy `#1E3A8A` & Academic Teal `#0D9488`), serta alur data realistis untuk memudahkan pengembangan frontend produksi (Next.js / React) selanjutnya.

---

## 🚀 Cara Menjalankan

Cukup jalankan satu perintah menggunakan Node.js (v22+):

```bash
# Dari root repositori
node apps/web/server.js

# Atau masuk ke direktori apps/web
cd apps/web
npm start
```

Buka peramban di: **`http://localhost:3000`**

Untuk me-reset data dummy kapan saja:
```bash
node apps/web/data/seed.js
```

---

## 📱 Peta Halaman Prototipe

Di bagian bawah setiap halaman prototipe, terdapat **Floating Prototype Switcher Bar** untuk beralih peran instan dalam 1 klik:

| Peran / Platform | Rute URL | Fitur Utama yang Disimulasikan |
|---|---|---|
| **🌐 Website Publik** | `/` | Profil sekolah, Akreditasi A, Berita & pengumuman dinamis dari SQLite, Layanan tamu. |
| **🔑 Gateway Masuk SSO** | `/masuk.html` | Form login terpadu + **Simulator 1-Klik** (Siswa, Ortu, Guru, Admin) + QR unduh APK Android. |
| **📋 PPDB Online** | `/ppdb.html` | Informasi 4 gelombang, kuota pendaftaran, alur 4 langkah, dan kalkulator simulasi skor seleksi. |
| **🎓 Portal Siswa** | `/siswa/index.html` | Dashboard siswa, banner ujian CBT aktif hari ini, jadwal kelas IX-A, presensi tap gerbang. |
| **📝 Web CBT Lab Komputer** | `/siswa/cbt.html` | Antarmuka ujian lab layar lebar (distraction-free), 6 format soal (PG, Kompleks, Benar/Salah, Menjodohkan, Isian, Esai), timer countdown sinkron, autosave debounced, dan **deteksi anti-cheat perpindahan tab/jendela (blur)**. |
| **📚 LMS Tugas Siswa** | `/siswa/tugas.html` | Daftar tugas modul ajar, status tenggat waktu, dan modal pengumpulan dokumen tugas. |
| **📊 E-Rapor Siswa** | `/siswa/rapor.html` | Nilai formatif & sumatif per mapel, KKTP, predikat Kurikulum Merdeka, tombol unduh PDF resmi. |
| **👨‍👩‍👧 Portal Orang Tua** | `/ortu/index.html` | **Multi-Anak Switcher Bar** (beralih antara *Ahmad Fauzan* dan *Nabila Putri* secara instan), tap gerbang kedatangan anak harian. |
| **📅 Presensi & Gerbang Ortu** | `/ortu/kehadiran.html` | Rekapitulasi jam masuk/pulang mesin RFID dan kalender kehadiran bulanan anak. |
| **📝 Surat Izin/Sakit Ortu** | `/ortu/izin.html` | Tabel riwayat izin & formulir pengajuan izin sakit online (tersimpan langsung ke SQLite!). |
| **📊 E-Rapor Anak Ortu** | `/ortu/rapor.html` | Rapor perkembangan berkala anak, catatan evaluasi wali kelas, dan validasi QR code. |
| **📊 Admin & Eksekutif** | `/admin/index.html` | Dashboard metrik manajemen sekolah, kehadiran guru 98.5%, log kedatangan gerbang realtime. |
| **👥 Master Siswa** | `/admin/siswa.html` | DataTable master siswa dengan pencarian realtime, filter kelas, modal biodata, dan ekspor CSV. |
| **📝 Entri Nilai Guru** | `/admin/nilai.html` | Grid spreadsheet input nilai cepat (Tugas, UH, PTS, PAS) dengan kalkulasi otomatis nilai akhir dan predikat. |
| **🖥️ CBT Live Monitor Lab** | `/admin/cbt-monitor.html` | Pemantauan ruang lab komputer real-time, progres butir terjawab, deteksi pelanggaran tab switch, dan reset sesi. |

---

## 🗄️ Struktur Data SQLite (`data/database.sqlite`)

1. `school_profile`: Data identitas NPSN dan akreditasi sekolah.
2. `students`: Data 6 siswa autentik lintas jenjang kelas VII s.d IX.
3. `guardians` & `student_guardians`: Relasi orang tua multi-anak (H. Suparman sebagai wali 2 siswa).
4. `attendance_logs`: Log presensi gerbang RFID/Face Recognition.
5. `leave_requests`: Surat permohonan izin/sakit.
6. `exams` & `exam_questions`: Ujian CBT & 10 butir soal dengan 6 variasi tipe soal lengkap formula KaTeX.
7. `exam_sessions`: Sesi pengerjaan siswa, status autosave jawaban, ragu-ragu, dan counter pelanggaran tab.
8. `grades`: Nilai komponen rapor Kurikulum Merdeka.
9. `announcements`: Berita warta sekolah.
