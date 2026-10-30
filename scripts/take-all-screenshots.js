const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// =========================================================================
// 1. DAFTAR HALAMAN WEB PUBLIK (PORT 3000)
// =========================================================================
const WEB_PUBLIC_PAGES = [
  { name: '01_beranda', url: 'http://localhost:3000' },
  { name: '02_profil', url: 'http://localhost:3000/profil' },
  { name: '03_akademik', url: 'http://localhost:3000/akademik' },
  { name: '04_berita', url: 'http://localhost:3000/berita' },
  { name: '05_galeri', url: 'http://localhost:3000/galeri' },
  { name: '06_kontak', url: 'http://localhost:3000/kontak' },
  { name: '07_ppdb_informasi', url: 'http://localhost:3000/ppdb' },
  { name: '08_ppdb_daftar', url: 'http://localhost:3000/ppdb/daftar' },
  { name: '09_ppdb_masuk', url: 'http://localhost:3000/ppdb/masuk' },
];

const PPDB_DASHBOARD_PAGE = {
  name: '10_ppdb_dashboard',
  url: 'http://localhost:3000/ppdb/dashboard',
};

// =========================================================================
// 2. DAFTAR HALAMAN ADMIN WEB (PORT 3000)
// =========================================================================
const WEB_ADMIN_PAGES = [
  { name: 'admin_01_dashboard', url: 'http://localhost:3000/admin' },

  // Master Data
  { name: 'admin_master_01_tahun_ajaran', url: 'http://localhost:3000/admin/master/academic-years' },
  { name: 'admin_master_02_kelas_rombel', url: 'http://localhost:3000/admin/master/classes' },
  { name: 'admin_master_03_mata_pelajaran', url: 'http://localhost:3000/admin/master/subjects' },
  { name: 'admin_master_04_guru_tendik', url: 'http://localhost:3000/admin/master/teachers' },
  { name: 'admin_master_05_induk_siswa', url: 'http://localhost:3000/admin/master/students' },
  { name: 'admin_master_06_orang_tua_wali', url: 'http://localhost:3000/admin/master/guardians' },

  // PPDB Panitia & Seleksi
  { name: 'admin_ppdb_01_ringkasan', url: 'http://localhost:3000/admin/ppdb' },
  { name: 'admin_ppdb_02_gelombang_jalur', url: 'http://localhost:3000/admin/ppdb/waves' },
  { name: 'admin_ppdb_03_verifikasi_pendaftar', url: 'http://localhost:3000/admin/ppdb/applicants' },
  { name: 'admin_ppdb_04_seleksi_perangkingan', url: 'http://localhost:3000/admin/ppdb/selection' },

  // Akademik & Pembelajaran
  { name: 'admin_akademik_01_ringkasan', url: 'http://localhost:3000/admin/academic' },
  { name: 'admin_akademik_02_jadwal_pelajaran', url: 'http://localhost:3000/admin/academic/schedules' },
  { name: 'admin_akademik_03_presensi_siswa', url: 'http://localhost:3000/admin/academic/attendance' },
  { name: 'admin_akademik_04_presensi_guru_staf', url: 'http://localhost:3000/admin/academic/staff-attendance' },
  { name: 'admin_akademik_05_modul_ajar', url: 'http://localhost:3000/admin/academic/teaching-materials' },
  { name: 'admin_akademik_06_tugas_siswa', url: 'http://localhost:3000/admin/academic/assignments' },
  { name: 'admin_akademik_07_jurnal_mengajar', url: 'http://localhost:3000/admin/academic/journals' },
  { name: 'admin_akademik_08_ledger_nilai', url: 'http://localhost:3000/admin/academic/grades' },
  { name: 'admin_akademik_09_catatan_karakter', url: 'http://localhost:3000/admin/academic/character-notes' },
  { name: 'admin_akademik_10_laporan_kemajuan', url: 'http://localhost:3000/admin/academic/progress-reports' },
  { name: 'admin_akademik_11_rapor_siswa', url: 'http://localhost:3000/admin/academic/report-cards' },
  { name: 'admin_akademik_12_pengajuan_cuti', url: 'http://localhost:3000/admin/academic/leave-requests' },

  // CBT (Computer Based Test)
  { name: 'admin_cbt_01_dashboard', url: 'http://localhost:3000/admin/cbt' },
  { name: 'admin_cbt_02_bank_soal', url: 'http://localhost:3000/admin/cbt/questions' },
  { name: 'admin_cbt_03_jadwal_ujian', url: 'http://localhost:3000/admin/cbt/exams' },
  { name: 'admin_cbt_04_monitoring_ujian', url: 'http://localhost:3000/admin/cbt/monitor' },

  // Bimbingan Konseling (BK)
  { name: 'admin_bk_01_dashboard', url: 'http://localhost:3000/admin/counseling' },
  { name: 'admin_bk_02_early_warning_system', url: 'http://localhost:3000/admin/counseling/early-warnings' },

  // Kesiswaan & Prestasi
  { name: 'admin_kesiswaan_01_dashboard', url: 'http://localhost:3000/admin/student-affairs' },
  { name: 'admin_kesiswaan_02_poin_pelanggaran_prestasi', url: 'http://localhost:3000/admin/student-affairs/points' },
  { name: 'admin_kesiswaan_03_ekstrakurikuler', url: 'http://localhost:3000/admin/student-affairs/extracurriculars' },
  { name: 'admin_kesiswaan_04_kompetisi_lomba', url: 'http://localhost:3000/admin/student-affairs/competitions' },

  // Sarana & Prasarana
  { name: 'admin_sarpras_01_fasilitas_ruang', url: 'http://localhost:3000/admin/facilities' },
  { name: 'admin_sarpras_02_perpustakaan', url: 'http://localhost:3000/admin/facilities/library' },
  { name: 'admin_sarpras_03_inventaris_aset', url: 'http://localhost:3000/admin/assets' },
  { name: 'admin_sarpras_04_tiket_perbaikan', url: 'http://localhost:3000/admin/tickets' },

  // Eksekutif, Humas, CMS, Laporan
  { name: 'admin_eksekutif_01_kpi_dashboard', url: 'http://localhost:3000/admin/executive' },
  { name: 'admin_eksekutif_02_persetujuan_kepsek', url: 'http://localhost:3000/admin/executive/approvals' },
  { name: 'admin_humas_01_kemitraan_alumni', url: 'http://localhost:3000/admin/public-relations' },
  { name: 'admin_cms_01_kelola_berita_konten', url: 'http://localhost:3000/admin/cms' },
  { name: 'admin_laporan_01_pusat_laporan_ekspor', url: 'http://localhost:3000/admin/reports' },

  // Konfigurasi & Keamanan
  { name: 'admin_pengaturan_01_identitas_sekolah', url: 'http://localhost:3000/admin/settings' },
  { name: 'admin_pengaturan_02_manajemen_pengguna', url: 'http://localhost:3000/admin/settings/users' },
  { name: 'admin_pengaturan_03_role_hak_akses', url: 'http://localhost:3000/admin/settings/roles' },
  { name: 'admin_pengaturan_04_audit_log_keamanan', url: 'http://localhost:3000/admin/settings/audit-logs' },
  { name: 'admin_notifikasi_01_pusat_pesan', url: 'http://localhost:3000/admin/notifications' },
];

// =========================================================================
// 3. DAFTAR HALAMAN PORTAL PER PERSONA (PORT 3001)
// =========================================================================
const PORTAL_GURU_PAGES = [
  { name: '02_guru_dashboard', url: 'http://localhost:3001/guru/dashboard' },
  { name: '03_guru_jadwal', url: 'http://localhost:3001/guru/jadwal' },
  { name: '04_guru_materi', url: 'http://localhost:3001/guru/materi' },
  { name: '05_guru_tugas', url: 'http://localhost:3001/guru/tugas' },
  { name: '06_guru_nilai', url: 'http://localhost:3001/guru/nilai' },
  { name: '07_guru_jurnal', url: 'http://localhost:3001/guru/jurnal' },
  { name: '08_guru_perizinan', url: 'http://localhost:3001/guru/perizinan' },
  { name: '09_guru_sarpras', url: 'http://localhost:3001/guru/sarpras' },
  { name: '10_guru_siswa', url: 'http://localhost:3001/guru/siswa' },
  { name: '11_guru_cbt', url: 'http://localhost:3001/guru/cbt' },
];

const PORTAL_SISWA_PAGES = [
  { name: '12_siswa_dashboard', url: 'http://localhost:3001/siswa/dashboard' },
  { name: '13_siswa_jadwal', url: 'http://localhost:3001/siswa/jadwal' },
  { name: '14_siswa_tugas', url: 'http://localhost:3001/siswa/tugas' },
  { name: '15_siswa_nilai', url: 'http://localhost:3001/siswa/nilai' },
  { name: '16_siswa_poin', url: 'http://localhost:3001/siswa/poin' },
  { name: '17_siswa_cbt', url: 'http://localhost:3001/siswa/cbt' },
  { name: '18_siswa_konseling', url: 'http://localhost:3001/siswa/konseling' },
];

const PORTAL_ORTU_PAGES = [
  { name: '19_ortu_dashboard', url: 'http://localhost:3001/ortu/dashboard' },
  { name: '20_ortu_presensi', url: 'http://localhost:3001/ortu/presensi' },
  { name: '21_ortu_nilai', url: 'http://localhost:3001/ortu/nilai' },
  { name: '22_ortu_poin', url: 'http://localhost:3001/ortu/poin' },
  { name: '23_ortu_biaya', url: 'http://localhost:3001/ortu/biaya' },
  { name: '24_ortu_konseling', url: 'http://localhost:3001/ortu/konseling' },
];

async function main() {
  const args = process.argv.slice(2);
  const onlyTarget = args.find((a) => a.startsWith('--only='))?.split('=')[1];
  const publicOnly = args.includes('--public');
  const adminOnly = args.includes('--admin');
  const ppdbOnly = args.includes('--ppdb');
  const guruOnly = args.includes('--guru');
  const siswaOnly = args.includes('--siswa');
  const ortuOnly = args.includes('--ortu');
  const singleOnly = args.includes('--single') || args.includes('--1');
  const isHeadless = args.includes('--headless');
  const webOnly = args.includes('--web');
  const portalOnly = args.includes('--portal') || guruOnly || siswaOnly || ortuOnly;

  const webDir = path.resolve('documentations/web');
  const portalDir = path.resolve('documentations/portal');
  fs.mkdirSync(webDir, { recursive: true });
  fs.mkdirSync(portalDir, { recursive: true });

  const tempProfileDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_doc_profile_' + Date.now());

  console.log(
    isHeadless
      ? '🚀 Membuka Chrome headless...'
      : '🚀 Membuka Chrome dengan jendela visual aktif (Desktop 1440x900) agar terlihat dan proses login lancar...'
  );

  const chromeFlags = [
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempProfileDir}`,
    'about:blank',
  ];
  if (isHeadless) {
    chromeFlags.unshift('--headless=new');
  }

  const chromeProc = spawn(CHROME_PATH, chromeFlags, { detached: false });

  chromeProc.on('error', (err) => {
    console.error('Gagal menjalankan Chrome:', err);
    process.exit(1);
  });

  // Tunggu port 9222 siap
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      versionData = await new Promise((resolve, reject) => {
        http
          .get('http://127.0.0.1:9222/json/version', (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
          })
          .on('error', reject);
      });
      if (versionData) break;
    } catch {}
  }

  if (!versionData) {
    console.error('❌ Tidak dapat menghubungkan ke Chrome DevTools port 9222.');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('✅ Chrome DevTools Protocol terhubung.');
  const ws = new WebSocket(versionData.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));

  function send(method, params = {}, sessionId = undefined) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  /**
   * Helper tangkap screenshot di tab aktif
   */
  async function captureActiveTab(sessionId, url, outPath, label) {
    process.stdout.write(`📸 [${label}] ${url}... `);
    try {
      // 1. Set resolusi desktop 1440x900
      await send(
        'Emulation.setDeviceMetricsOverride',
        {
          width: 1440,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false,
        },
        sessionId
      );

      // 2. Navigasi ke URL jika belum di URL tersebut
      let currentUrl = '';
      try {
        const cur = await send('Runtime.evaluate', { expression: 'window.location.href' }, sessionId);
        currentUrl = cur?.result?.value || '';
      } catch (e) {}

      if (currentUrl !== url) {
        await send('Page.navigate', { url }, sessionId);
      }
      await new Promise((r) => setTimeout(r, 1200));

      // 3. Tunggu data faktual DOM benar-benar READY (seluruh skeleton & loader tuntas)
      try {
        await send(
          'Runtime.evaluate',
          {
            awaitPromise: true,
            expression: `(async () => {
              const maxWait = 20000; // maksimal 20 detik
              const start = Date.now();

              // Tunggu minimal 1000ms agar React Query / hydration sempat memulai fetching
              await new Promise(r => setTimeout(r, 1000));

              while (Date.now() - start < maxWait) {
                // a. Deteksi elemen loader, spinner, dan skeleton
                const loaders = document.querySelectorAll(
                  '.animate-spin, .animate-pulse, [class*="skeleton"], [aria-busy="true"], [data-loading="true"]'
                );

                // b. Deteksi teks sementara penanda proses memuat
                const bodyText = document.body ? document.body.innerText : '';
                const isLoadingText = 
                  bodyText.includes('Memuat Dashboard') ||
                  bodyText.includes('Memverifikasi hak akses') ||
                  bodyText.includes('Mengarahkan ke halaman login') ||
                  bodyText.includes('Menghubungkan ke sistem PPDB');

                // c. Deteksi keberadaan konten utama
                const hasMainContent = 
                  document.querySelector('main') !== null ||
                  document.querySelector('h1') !== null ||
                  document.querySelector('table') !== null ||
                  document.querySelectorAll('div[class*="rounded"]').length > 4;

                // Jika sudah bebas loader, tidak ada teks memuat, dan konten utama sudah ter-render:
                if (loaders.length === 0 && !isLoadingText && hasMainContent) {
                  // Beri buffer 700ms agar layout, font, dan icon stabil
                  await new Promise(r => setTimeout(r, 700));
                  return { ready: true, elapsedMs: Date.now() - start };
                }

                await new Promise(r => setTimeout(r, 250));
              }

              return { ready: false, timeout: true };
            })()`,
          },
          sessionId
        );
      } catch (e) {}

      // 4. Scroll ke bawah lalu ke atas untuk memicu IntersectionObserver & lazy image pada dokumen yang sudah terisi data
      try {
        await send(
          'Runtime.evaluate',
          {
            awaitPromise: true,
            expression: `(async () => {
              const doc = document.scrollingElement || document.documentElement;
              const total = doc.scrollHeight;
              const step = 450;
              let pos = 0;
              while (pos < total) {
                pos += step;
                window.scrollTo(0, pos);
                await new Promise(r => setTimeout(r, 50));
              }
              window.scrollTo(0, 0);
            })()`,
          },
          sessionId
        );
      } catch (e) {}

      // 5. Tunggu semua gambar selesai di-render
      try {
        await send(
          'Runtime.evaluate',
          {
            awaitPromise: true,
            expression: `(async () => {
              const imgs = Array.from(document.images);
              await Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(res => {
                  img.onload = res;
                  img.onerror = res;
                  setTimeout(res, 2500);
                });
              }));
            })()`,
          },
          sessionId
        );
      } catch (e) {}

      await new Promise((r) => setTimeout(r, 500));

      // 6. Ukur tinggi alami dokumen
      let naturalHeight = 900;
      try {
        const metrics = await send('Page.getLayoutMetrics', {}, sessionId);
        const evalHeight = await send(
          'Runtime.evaluate',
          {
            expression: `Math.max(
              document.body.scrollHeight,
              document.documentElement.scrollHeight,
              document.body.offsetHeight,
              900
            )`,
          },
          sessionId
        );

        naturalHeight = Math.ceil(
          Math.max(metrics.cssContentSize?.height || 0, evalHeight?.result?.value || 0, 900)
        );
      } catch (e) {
        naturalHeight = 1200;
      }

      // 7. Ambil screenshot penuh dengan clip tanpa mengubah viewport height
      const screenshot = await send(
        'Page.captureScreenshot',
        {
          format: 'png',
          clip: {
            x: 0,
            y: 0,
            width: 1440,
            height: naturalHeight,
            scale: 1,
          },
          captureBeyondViewport: true,
        },
        sessionId
      );

      fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
      console.log(`✅ Selesai (1440 x ${naturalHeight}px)`);
    } catch (err) {
      console.log(`⚠️ Gagal (${err.message})`);
    }
  }

  try {
    // =========================================================================
    // SEKSI A: HALAMAN PUBLIK WEB (PORT 3000)
    // =========================================================================
    if (!portalOnly && !adminOnly && !ppdbOnly) {
      let publicItems = WEB_PUBLIC_PAGES;
      if (onlyTarget) {
        publicItems = publicItems.filter((p) => p.name.includes(onlyTarget));
      }

      if (publicItems.length > 0) {
        console.log('\n--- 1. Memproses Halaman Web Publik & PPDB (Port 3000) ---');
        const target = await send('Target.createTarget', { url: 'about:blank' });
        const attach = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
        const sessionId = attach.sessionId;
        await send('Page.enable', {}, sessionId);

        for (const item of publicItems) {
          const outPath = path.join(webDir, `${item.name}.png`);
          await captureActiveTab(sessionId, item.url, outPath, `Web Publik: ${item.name}`);
        }

        await send('Target.closeTarget', { targetId: target.targetId });
      }
    }

    // =========================================================================
    // SEKSI B: PPDB DASHBOARD (PORT 3000) DENGAN LOGIN muhfattah@gmail.com
    // =========================================================================
    if (!portalOnly && !adminOnly && (!onlyTarget || onlyTarget.includes('ppdb_dashboard') || onlyTarget.includes('dashboard') || onlyTarget.includes('10'))) {
      console.log('\n--- 2. Memproses PPDB Dashboard dengan Login Calon Siswa (muhfattah@gmail.com) ---');
      const target = await send('Target.createTarget', { url: 'about:blank' });
      const attach = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
      const sessionId = attach.sessionId;
      await send('Page.enable', {}, sessionId);

      await send(
        'Emulation.setDeviceMetricsOverride',
        { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
        sessionId
      );

      // Buka halaman login PPDB
      console.log('🔑 Mengisi formulir login PPDB...');
      await send('Page.navigate', { url: 'http://localhost:3000/ppdb/masuk' }, sessionId);
      await new Promise((r) => setTimeout(r, 2000));

      // 1. Eksekusi pengisian input dengan React native descriptor setter & klik submit
      const formAttempt = await send(
        'Runtime.evaluate',
        {
          awaitPromise: true,
          expression: `(async () => {
            const setReactValue = (el, val) => {
              if (!el) return;
              el.focus();
              const proto = Object.getPrototypeOf(el);
              const desc = Object.getOwnPropertyDescriptor(proto, 'value');
              desc.set.call(el, val);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            };

            const idInput = document.getElementById('identifier');
            const passInput = document.getElementById('password');
            const submitBtn = document.querySelector('button[type="submit"]');

            if (idInput && passInput && submitBtn) {
              setReactValue(idInput, 'muhfattah@gmail.com');
              setReactValue(passInput, '123456789');
              await new Promise(r => setTimeout(r, 400));
              submitBtn.click();
              return { success: true };
            }
            return { success: false, reason: 'Elemen formulir tidak ditemukan' };
          })()`,
        },
        sessionId
      );

      // 2. Tunggu proses redirect form
      console.log('⏳ Menunggu redirect ke /ppdb/dashboard...');
      let isDashboard = false;
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const res = await send('Runtime.evaluate', { expression: 'window.location.pathname' }, sessionId);
          if (res?.result?.value?.includes('/ppdb/dashboard')) {
            isDashboard = true;
            console.log('✅ Berhasil masuk ke Dashboard PPDB via form submit!');
            break;
          }
        } catch (e) {}
      }

      // 3. Fallback andal: Jika form belum beralih (misal batasan event atau React timing),
      // panggil API login langsung dari browser session lalu simpan token ke storage!
      if (!isDashboard) {
        console.log('⚡ Mengamankan sesi via API Direct Login & Storage Injection...');
        const apiLoginResult = await send(
          'Runtime.evaluate',
          {
            awaitPromise: true,
            expression: `(async () => {
              try {
                const apiRes = await fetch('http://127.0.0.1:8000/api/v1/ppdb/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  body: JSON.stringify({
                    identifier: 'muhfattah@gmail.com',
                    password: '123456789',
                  }),
                });
                const resJson = await apiRes.json();
                const payload = resJson.data || resJson;

                if (payload.accessToken) {
                  localStorage.setItem('auth_token', payload.accessToken);
                  localStorage.setItem('sistlabum_access_token', payload.accessToken);
                  sessionStorage.setItem('sistlabum_access_token', payload.accessToken);
                  localStorage.setItem('user_role', 'guest');
                  if (payload.refreshToken) {
                    localStorage.setItem('sistlabum_refresh_token', payload.refreshToken);
                    sessionStorage.setItem('sistlabum_refresh_token', payload.refreshToken);
                  }
                  if (payload.user) {
                    localStorage.setItem('sistlabum_user_profile', JSON.stringify(payload.user));
                    sessionStorage.setItem('sistlabum_user_profile', JSON.stringify(payload.user));
                  }
                  window.location.href = 'http://localhost:3000/ppdb/dashboard';
                  return { success: true };
                }
                return { success: false, error: resJson };
              } catch (err) {
                return { success: false, error: err.message };
              }
            })()`,
          },
          sessionId
        );

        const evalRes = apiLoginResult?.result?.value;
        if (evalRes?.success) {
          console.log('✅ Token PPDB berhasil disuntikkan, beralih ke /ppdb/dashboard...');
          await new Promise((r) => setTimeout(r, 2500));
          isDashboard = true;
        } else {
          console.log('⚠️ Respon Login API:', JSON.stringify(evalRes?.error || 'Gagal'));
        }
      }

      // Pastikan tab benar-benar di /ppdb/dashboard sebelum capture
      await send('Page.navigate', { url: 'http://localhost:3000/ppdb/dashboard' }, sessionId);
      await new Promise((r) => setTimeout(r, 2000));

      const outPath = path.join(webDir, `${PPDB_DASHBOARD_PAGE.name}.png`);
      await captureActiveTab(sessionId, PPDB_DASHBOARD_PAGE.url, outPath, `Web: ${PPDB_DASHBOARD_PAGE.name}`);

      await send('Target.closeTarget', { targetId: target.targetId });
    }

    // =========================================================================
    // SEKSI C: MODUL ADMIN WEB (DINONAKTIFKAN KECUALI DENGAN --admin)
    // Sesuai permintaan user: hanya web publik, PPDB, dan portal yang diambil
    // =========================================================================
    if (adminOnly) {
      let adminItems = WEB_ADMIN_PAGES;
      if (onlyTarget) {
        adminItems = adminItems.filter((p) => p.name.includes(onlyTarget));
      }

      if (adminItems.length > 0) {
        console.log('\n--- 3. Memproses Modul Admin Web (Port 3000) ---');
        const target = await send('Target.createTarget', { url: 'about:blank' });
        const attach = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
        const sessionId = attach.sessionId;
        await send('Page.enable', {}, sessionId);

        await send(
          'Emulation.setDeviceMetricsOverride',
          { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
          sessionId
        );

        console.log('🔑 Melakukan autentikasi Admin Sekolah...');
        await send('Page.navigate', { url: 'http://localhost:3000/masuk' }, sessionId);
        await new Promise((r) => setTimeout(r, 1500));

        try {
          await send(
            'Runtime.evaluate',
            {
              expression: `(() => {
                const idInput = document.querySelector('input[name="identifier"], #identifier, input[type="text"]');
                const passInput = document.querySelector('input[name="password"], #password, input[type="password"]');
                const submitBtn = document.querySelector('button[type="submit"]');
                if (idInput && passInput && submitBtn) {
                  idInput.value = 'admin.staging';
                  idInput.dispatchEvent(new Event('input', { bubbles: true }));
                  idInput.dispatchEvent(new Event('change', { bubbles: true }));
                  passInput.value = 'SistLabUM2026!UAT';
                  passInput.dispatchEvent(new Event('input', { bubbles: true }));
                  passInput.dispatchEvent(new Event('change', { bubbles: true }));
                  submitBtn.click();
                }
              })()`,
            },
            sessionId
          );
        } catch (e) {}

        await new Promise((r) => setTimeout(r, 2000));
        for (let i = 0; i < 25; i++) {
          try {
            const res = await send('Runtime.evaluate', { expression: 'window.location.pathname' }, sessionId);
            if (res?.result?.value?.startsWith('/admin')) {
              console.log('✅ Berhasil masuk ke Admin Dashboard!');
              break;
            }
          } catch (e) {}
          await new Promise((r) => setTimeout(r, 200));
        }

        for (const item of adminItems) {
          const outPath = path.join(webDir, `${item.name}.png`);
          await captureActiveTab(sessionId, item.url, outPath, `Web Admin: ${item.name}`);
        }

        await send('Target.closeTarget', { targetId: target.targetId });
      }
    }

    // =========================================================================
    // SEKSI D: PORTAL MANDIRI (PORT 3001) - LOGIN VIA CARD PRESET
    // =========================================================================
    if (!webOnly && !adminOnly && !publicOnly && !ppdbOnly) {
      console.log('\n--- 4. Memproses Portal Mandiri Port 3001 (Card Login Presets) ---');

      async function loginPortalRoleCard(sessionId, roleName) {
        console.log(`🔑 Mengklik card preset login [${roleName}] di Portal...`);
        await send('Page.navigate', { url: 'http://localhost:3001/login' }, sessionId);
        await new Promise((r) => setTimeout(r, 2000));

        const presetMap = {
          'Guru': { id: 'guru.mtk', pass: 'SistLabUM2026!UAT', path: '/guru/dashboard' },
          'Siswa': { id: 'siswa.lab.001', pass: 'SistLabUM2026!UAT', path: '/siswa/dashboard' },
          'Wali Murid': { id: 'ortu.siswa.001', pass: 'password', path: '/ortu/dashboard' },
        };
        const activePreset = presetMap[roleName] || { id: 'guru.mtk', pass: 'SistLabUM2026!UAT', path: '/guru/dashboard' };

        // 1. Klik tombol preset di layar atau isi input dengan React native setter
        await send(
          'Runtime.evaluate',
          {
            awaitPromise: true,
            expression: `(async () => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const cardBtn = buttons.find(b => (b.innerText || '').includes('${roleName}'));
              if (cardBtn) {
                cardBtn.click();
                await new Promise(r => setTimeout(r, 400));
              }

              // Pastikan input benar-benar terisi
              const idInput = document.getElementById('identifier');
              const passInput = document.getElementById('password');
              if (idInput && (!idInput.value || idInput.value.length === 0)) {
                const proto = Object.getPrototypeOf(idInput);
                const desc = Object.getOwnPropertyDescriptor(proto, 'value');
                desc.set.call(idInput, '${activePreset.id}');
                idInput.dispatchEvent(new Event('input', { bubbles: true }));
                idInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
              if (passInput && (!passInput.value || passInput.value.length === 0)) {
                const proto = Object.getPrototypeOf(passInput);
                const desc = Object.getOwnPropertyDescriptor(proto, 'value');
                desc.set.call(passInput, '${activePreset.pass}');
                passInput.dispatchEvent(new Event('input', { bubbles: true }));
                passInput.dispatchEvent(new Event('change', { bubbles: true }));
              }

              await new Promise(r => setTimeout(r, 300));
              const submitBtn = document.querySelector('button[type="submit"]');
              if (submitBtn) submitBtn.click();
            })()`,
          },
          sessionId
        );

        // 2. Tunggu redirect ke dashboard role
        let isRoleActive = false;
        for (let i = 0; i < 15; i++) {
          await new Promise((r) => setTimeout(r, 500));
          try {
            const res = await send('Runtime.evaluate', { expression: 'window.location.pathname' }, sessionId);
            if (res?.result?.value && !res.result.value.includes('/login')) {
              console.log(`   ✅ Sesi [${roleName}] aktif di ${res.result.value}`);
              isRoleActive = true;
              break;
            }
          } catch (e) {}
        }

        // 3. Fallback direct API login & sessionStorage injection jika belum beralih
        if (!isRoleActive) {
          console.log(`   ⚡ Mengamankan sesi portal [${roleName}] via Direct API login...`);
          await send(
            'Runtime.evaluate',
            {
              awaitPromise: true,
              expression: `(async () => {
                try {
                  const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                      identifier: '${activePreset.id}',
                      password: '${activePreset.pass}',
                    }),
                  });
                  const json = await res.json();
                  const payload = json.data || json;
                  if (payload.tokens?.accessToken) {
                    sessionStorage.setItem('sistlabum_portal_token', payload.tokens.accessToken);
                    if (payload.tokens.refreshToken) {
                      sessionStorage.setItem('sistlabum_portal_refresh', payload.tokens.refreshToken);
                    }
                    if (payload.user) {
                      sessionStorage.setItem('sistlabum_portal_user', JSON.stringify(payload.user));
                    }
                    window.location.href = '${activePreset.path}';
                    return { success: true };
                  }
                  return { success: false, error: json };
                } catch (err) {
                  return { success: false, error: err.message };
                }
              })()`,
            },
            sessionId
          );

          await new Promise((r) => setTimeout(r, 2500));
        }
      }

      // 1. Ambil screenshot halaman login itu sendiri (hanya jika tidak memilih role tertentu)
      if (!guruOnly && !siswaOnly && !ortuOnly && (!onlyTarget || onlyTarget.includes('login') || onlyTarget.includes('01'))) {
        const targetLogin = await send('Target.createTarget', { url: 'about:blank' });
        const attachLogin = await send('Target.attachToTarget', { targetId: targetLogin.targetId, flatten: true });
        const sessionLogin = attachLogin.sessionId;
        await send('Page.enable', {}, sessionLogin);
        const outPath = path.join(portalDir, '01_portal_login.png');
        await captureActiveTab(sessionLogin, 'http://localhost:3001/login', outPath, 'Portal: 01_portal_login');
        await send('Target.closeTarget', { targetId: targetLogin.targetId });
      }

      // 2. Modul Guru (login via preset Guru)
      let guruItems = PORTAL_GURU_PAGES;
      if (siswaOnly || ortuOnly) guruItems = [];
      if (onlyTarget) guruItems = guruItems.filter((p) => p.name.includes(onlyTarget));
      if (singleOnly && guruItems.length > 0) guruItems = [guruItems[0]]; // Ambil 1 halaman saja (Dashboard)

      if (guruItems.length > 0) {
        console.log('\n--- 4a. Mengambil Screenshot Halaman Guru ---');
        const targetGuru = await send('Target.createTarget', { url: 'about:blank' });
        const attachGuru = await send('Target.attachToTarget', { targetId: targetGuru.targetId, flatten: true });
        const sessionGuru = attachGuru.sessionId;
        await send('Page.enable', {}, sessionGuru);

        await loginPortalRoleCard(sessionGuru, 'Guru');

        for (const item of guruItems) {
          const outPath = path.join(portalDir, `${item.name}.png`);
          await captureActiveTab(sessionGuru, item.url, outPath, `Portal Guru: ${item.name}`);
        }

        await send('Target.closeTarget', { targetId: targetGuru.targetId });
      }

      // 3. Modul Siswa (login via preset Siswa)
      let siswaItems = PORTAL_SISWA_PAGES;
      if (guruOnly || ortuOnly) siswaItems = [];
      if (onlyTarget) siswaItems = siswaItems.filter((p) => p.name.includes(onlyTarget));
      if (singleOnly && siswaItems.length > 0) siswaItems = [siswaItems[0]];

      if (siswaItems.length > 0) {
        console.log('\n--- 4b. Mengambil Screenshot Halaman Siswa ---');
        const targetSiswa = await send('Target.createTarget', { url: 'about:blank' });
        const attachSiswa = await send('Target.attachToTarget', { targetId: targetSiswa.targetId, flatten: true });
        const sessionSiswa = attachSiswa.sessionId;
        await send('Page.enable', {}, sessionSiswa);

        await loginPortalRoleCard(sessionSiswa, 'Siswa');

        for (const item of siswaItems) {
          const outPath = path.join(portalDir, `${item.name}.png`);
          await captureActiveTab(sessionSiswa, item.url, outPath, `Portal Siswa: ${item.name}`);
        }

        await send('Target.closeTarget', { targetId: targetSiswa.targetId });
      }

      // 4. Modul Orang Tua (login via preset Wali Murid)
      let ortuItems = PORTAL_ORTU_PAGES;
      if (guruOnly || siswaOnly) ortuItems = [];
      if (onlyTarget) ortuItems = ortuItems.filter((p) => p.name.includes(onlyTarget));
      if (singleOnly && ortuItems.length > 0) ortuItems = [ortuItems[0]];

      if (ortuItems.length > 0) {
        console.log('\n--- 4c. Mengambil Screenshot Halaman Orang Tua ---');
        const targetOrtu = await send('Target.createTarget', { url: 'about:blank' });
        const attachOrtu = await send('Target.attachToTarget', { targetId: targetOrtu.targetId, flatten: true });
        const sessionOrtu = attachOrtu.sessionId;
        await send('Page.enable', {}, sessionOrtu);

        await loginPortalRoleCard(sessionOrtu, 'Wali Murid');

        for (const item of ortuItems) {
          const outPath = path.join(portalDir, `${item.name}.png`);
          await captureActiveTab(sessionOrtu, item.url, outPath, `Portal Ortu: ${item.name}`);
        }

        await send('Target.closeTarget', { targetId: targetOrtu.targetId });
      }
    }

    console.log('\n🎉 Seluruh screenshot halaman penuh telah berhasil diproses!');
    console.log(`📁 Web: ${webDir}`);
    console.log(`📁 Portal: ${portalDir}`);
  } finally {
    ws.close();
    chromeProc.kill();
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(console.error);
