'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ppdbApi } from '@/features/ppdb/ppdb-api';
import { tokenStorage } from '@/lib/auth/token-storage';
import {
  ApplicantProfileResponse,
  ApplicantProfileApplication,
  PPDBWaveItem,
  PPDBTrackItem,
} from '@/types/ppdb';
import {
  School,
  LogOut,
  User,
  Users,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Loader2,
  Save,
  Send,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  FileCheck,
  Check,
  Lock,
  X,
  Phone,
  Eye,
  Trash2,
  Download,
  RotateCw,
  Bell,
  CreditCard,
  ArrowRight,
  Info,
  Award,
  Trophy,
  BookOpen,
  HeartHandshake,
  BookCheck,
} from 'lucide-react';

export default function ApplicantDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth Guard: Cek apakah token otentikasi tersedia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = tokenStorage.getAccessToken() || localStorage.getItem('auth_token');
      if (!token) {
        router.replace('/ppdb/masuk');
      }
    }
  }, [router]);

  // Query Data Profil Pendaftar
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery<ApplicantProfileResponse>({
    queryKey: ['ppdb-applicant-me'],
    queryFn: () => ppdbApi.getMe(),
    retry: 1,
  });

  // Query Active Waves & Tracks
  const { data: activeWave } = useQuery<PPDBWaveItem | null>({
    queryKey: ['ppdb-active-wave-for-dashboard'],
    queryFn: () => ppdbApi.getActiveWave(),
  });

  const { data: publicWaves = [] } = useQuery<PPDBWaveItem[]>({
    queryKey: ['ppdb-public-waves-list'],
    queryFn: () => ppdbApi.listPublicWaves(),
  });

  const { data: tracks = [] } = useQuery<PPDBTrackItem[]>({
    queryKey: ['ppdb-tracks-for-dashboard', activeWave?.id],
    queryFn: () => ppdbApi.listPublicTracks(activeWave?.id || undefined),
  });

  const activeApplication: ApplicantProfileApplication | undefined =
    profile?.applications?.[0];

  // Active Menu / Tab View State ('dashboard' | 'biodata' | 'orang_tua' | 'sekolah' | 'berkas' | 'status' | 'kartu' | 'pengumuman' | 'faq')
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState<string | null>(null);

  // Auto-dismiss floating toast notification setelah 6 detik
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Form Data State
  const [personalData, setPersonalData] = useState({
    full_name: '',
    nik: '',
    nisn: '',
    birth_place: '',
    birth_date: '',
    gender: 'L',
    religion: 'Islam',
    address: '',
  });

  const [parentData, setParentData] = useState({
    father_name: '',
    father_job: '',
    father_phone: '',
    mother_name: '',
    mother_job: '',
    mother_phone: '',
    income_range: '< 3 Juta',
  });

  const [schoolData, setSchoolData] = useState({
    origin_school: '',
    npsn: '',
    graduation_year: '2026',
    average_score: '',
  });

  const [choiceData, setChoiceData] = useState({
    track_id: '',
    wave_id: '',
    notes: '',
  });

  // Populate data faktual saat aplikasi dimuat dari profil backend
  useEffect(() => {
    if (activeApplication) {
      const steps = activeApplication.step_data || {};
      const personal = (steps.personal as any) || {};
      const parent = (steps.parent as any) || {};
      const school = (steps.school as any) || {};

      setPersonalData({
        full_name: activeApplication.full_name || personal.full_name || '',
        nik: personal.nik || '',
        nisn: personal.nisn || '',
        birth_place: personal.birth_place || '',
        birth_date: activeApplication.birth_date || personal.birth_date || '',
        gender: personal.gender || 'L',
        religion: personal.religion || 'Islam',
        address: personal.address || '',
      });

      setParentData({
        father_name: parent.father_name || '',
        father_job: parent.father_job || '',
        father_phone: parent.father_phone || '',
        mother_name: parent.mother_name || '',
        mother_job: parent.mother_job || '',
        mother_phone: parent.mother_phone || '',
        income_range: parent.income_range || '< 3 Juta',
      });

      setSchoolData({
        origin_school: school.origin_school || '',
        npsn: school.npsn || '',
        graduation_year: school.graduation_year || '2026',
        average_score: school.average_score || '',
      });

      setChoiceData({
        track_id: activeApplication.track?.id || '',
        wave_id: activeApplication.wave?.id || '',
        notes: (steps.track as any)?.notes || '',
      });
    } else {
      const resolvedWaveId =
        activeWave?.id ||
        publicWaves.find((w) => w.status === 'aktif')?.id ||
        publicWaves[0]?.id ||
        tracks[0]?.wave_id ||
        '';
      const resolvedTrackId = choiceData.track_id || tracks[0]?.id || '';

      if (resolvedWaveId || resolvedTrackId) {
        setChoiceData((prev) => ({
          ...prev,
          wave_id: prev.wave_id || resolvedWaveId,
          track_id: prev.track_id || resolvedTrackId,
        }));
      }
    }
  }, [activeApplication, activeWave, publicWaves, tracks]);

  // Mutation Inisialisasi Pendaftaran Baru
  const createApplicationMutation = useMutation({
    mutationFn: () => {
      const targetWaveId =
        choiceData.wave_id ||
        activeWave?.id ||
        publicWaves.find((w) => w.status === 'aktif')?.id ||
        publicWaves[0]?.id ||
        tracks[0]?.wave_id ||
        '';
      const targetTrackId = choiceData.track_id || tracks[0]?.id || '';

      if (!targetTrackId) {
        throw new Error('Jalur pendaftaran wajib dipilih. Silakan pilih salah satu jalur pendaftaran.');
      }

      return ppdbApi.createApplication({
        wave_id: targetWaveId,
        track_id: targetTrackId,
        full_name: personalData.full_name?.trim() || profile?.username || 'Calon Siswa',
        nik: personalData.nik?.trim() || '3579000000000000',
        birth_date: personalData.birth_date || '2010-01-01',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-applicant-me'] });
      setFeedbackMessage({
        type: 'success',
        text: 'Draf pendaftaran berhasil dibuat! Silakan unggah berkas persyaratan di bawah ini.',
      });
      setActiveMenu('berkas');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.errors?.track_id?.[0] ||
        err.response?.data?.errors?.nik?.[0] ||
        err.response?.data?.errors?.wave_id?.[0] ||
        err.response?.data?.message ||
        err.message ||
        'Gagal memulai draf pendaftaran. Pastikan gelombang pendaftaran sedang aktif.';
      setFeedbackMessage({
        type: 'error',
        text: msg,
      });
    },
  });

  // Mutation Simpan Draf Langkah Formulir
  const saveStepMutation = useMutation({
    mutationFn: async ({ step, data }: { step: string | number; data: any }) => {
      if (!activeApplication) return;
      return ppdbApi.updateStep(activeApplication.id, step, data);
    },
    onSuccess: () => {
      setFeedbackMessage({ type: 'success', text: 'Perubahan data berhasil disimpan.' });
      queryClient.invalidateQueries({ queryKey: ['ppdb-applicant-me'] });
    },
    onError: (err: any) => {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal menyimpan perubahan.',
      });
    },
  });

  // Mutation Submit Final Pendaftaran
  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!activeApplication) return;
      return ppdbApi.submitApplication(activeApplication.id);
    },
    onSuccess: () => {
      setIsSubmitModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: 'Formulir pendaftaran berhasil disubmit secara resmi! Berkas Anda akan diverifikasi panitia.',
      });
      queryClient.invalidateQueries({ queryKey: ['ppdb-applicant-me'] });
    },
    onError: (err: any) => {
      setIsSubmitModalOpen(false);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal submit formulir. Pastikan semua berkas wajib telah diunggah.',
      });
    },
  });

  // Handler Simpan Data Aktif
  const handleSaveActiveSection = () => {
    if (!activeApplication) {
      const targetTrackId = choiceData.track_id || tracks[0]?.id;
      if (!targetTrackId) {
        setFeedbackMessage({
          type: 'error',
          text: 'Silakan pilih Jalur Pendaftaran terlebih dahulu.',
        });
        return;
      }
      if (!personalData.full_name?.trim()) {
        setFeedbackMessage({
          type: 'error',
          text: 'Nama lengkap calon siswa wajib diisi.',
        });
        return;
      }
      if (!personalData.nik || personalData.nik.trim().length !== 16) {
        setFeedbackMessage({
          type: 'error',
          text: 'NIK calon siswa wajib 16 digit angka numerik.',
        });
        return;
      }
      createApplicationMutation.mutate();
      return;
    }

    if (activeMenu === 'biodata') {
      saveStepMutation.mutate({ step: 'personal', data: personalData });
    } else if (activeMenu === 'orang_tua') {
      saveStepMutation.mutate({
        step: 'parent',
        data: {
          ...parentData,
          parents: [
            { parent_type: 'ayah', name: parentData.father_name, occupation: parentData.father_job, phone: parentData.father_phone },
            { parent_type: 'ibu', name: parentData.mother_name, occupation: parentData.mother_job, phone: parentData.mother_phone },
          ],
        },
      });
    } else if (activeMenu === 'sekolah') {
      saveStepMutation.mutate({ step: 'school', data: schoolData });
    }
  };

  // Handler Upload Dokumen Berkas
  const handleFileUpload = async (docType: string, file: File) => {
    if (!activeApplication) {
      setFeedbackMessage({ type: 'error', text: 'Silakan simpan data biodata terlebih dahulu sebelum mengunggah berkas.' });
      return;
    }
    setIsUploadingDoc(docType);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('document_type', docType);
      await ppdbApi.uploadDocument(activeApplication.id, fd);
      setFeedbackMessage({ type: 'success', text: `Berkas ${docType} berhasil diunggah.` });
      refetchProfile();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || `Gagal mengunggah berkas ${docType}. Pastikan ukuran di bawah 2MB.`,
      });
    } finally {
      setIsUploadingDoc(null);
    }
  };

  // Handler Hapus Dokumen
  const handleDeleteDocument = async (docId: string, docLabel: string) => {
    if (!activeApplication || !docId) return;
    if (!confirm(`Hapus berkas ${docLabel}? Anda harus mengunggah ulang dokumen ini.`)) return;
    try {
      await ppdbApi.deleteDocument(activeApplication.id, docId);
      setFeedbackMessage({ type: 'success', text: `Berkas ${docLabel} berhasil dihapus.` });
      refetchProfile();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || `Gagal menghapus berkas ${docLabel}.`,
      });
    }
  };

  // Handler Logout
  const handleLogout = () => {
    tokenStorage.clearAll();
    router.push('/ppdb/masuk');
  };

  // State Locked: jika sudah disubmit dan bukan dalam status revisi
  const isLocked = !!activeApplication?.status && !['draft', 'revision'].includes(activeApplication.status);

  // Loading State
  if (isLoadingProfile) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-9 h-9 text-[#062940] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#062940]">Memuat Dashboard Pendaftar...</p>
          <p className="text-xs text-gray-500">Menghubungkan ke sistem PPDB SMP Laboratorium UM</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isProfileError) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/90 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-pub-heading text-xl font-bold text-[#062940]">Sesi Masuk Telah Berakhir</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Sesi masuk Anda telah kedaluwarsa demi keamanan. Silakan masuk kembali ke akun calon siswa.
          </p>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#062940] hover:bg-[#0A3D62] text-white font-bold text-xs py-3 px-5 rounded-xl shadow-xs transition-colors"
          >
            <span>Masuk Kembali ke Portal Pendaftar</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Dokumen Persyaratan Resmi PPDB SMP Laboratorium UM
  const documentsConfig = [
    {
      type: 'KK',
      label: 'Kartu Keluarga (KK)',
      desc: 'Scan Kartu Keluarga terbaru yang masih berlaku.',
      req: true,
      icon: User,
    },
    {
      type: 'AKTA',
      label: 'Akta Kelahiran',
      desc: 'Scan Akta Kelahiran asli calon peserta didik.',
      req: true,
      icon: FileText,
    },
    {
      type: 'FOTO',
      label: 'Pas Foto Berwarna',
      desc: 'Ukuran 3x4 formal terbaru dengan latar belakang merah atau biru.',
      req: true,
      icon: User,
    },
    {
      type: 'RAPOR',
      label: 'Nilai Rapor SD/MI',
      desc: 'Scan rapor semester 1 s/d 5 (atau Surat Keterangan Lulus dari sekolah asal).',
      req: true,
      icon: FileText,
    },
    {
      type: 'PRESTASI',
      label: 'Sertifikat Prestasi / Piagam Kejuaraan / KIP',
      desc: 'Bagi pendaftar jalur Prestasi atau Afirmasi (opsional bagi jalur reguler).',
      req: false,
      icon: FileText,
    },
  ];

  // Nilai Faktual Nyata Akun Pendaftar
  const studentName = personalData.full_name || activeApplication?.full_name || profile?.username || profile?.email || 'Calon Peserta Didik';
  const regNo = activeApplication?.registration_no || 'Belum Diterbitkan (Isi Draf)';
  const registrationDate = (activeApplication as any)?.created_at
    ? new Date((activeApplication as any).created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  // Evaluasi Faktual Tahapan Stepper (Langkah 1 s/d 5)
  const isStep1Done = !!profile?.id; // Akun terdaftar & terverifikasi
  const isStep2Done = Boolean(
    activeApplication &&
    (activeApplication.full_name || (activeApplication.step_data as any)?.personal?.full_name)
  ); // Biodata telah tersimpan secara resmi di draf aplikasi backend
  const requiredDocTypes = ['KK', 'AKTA', 'FOTO', 'RAPOR'];
  const uploadedRequiredCount = requiredDocTypes.filter((type) =>
    activeApplication?.documents?.some((d) => d.document_type === type && d.status !== 'ditolak')
  ).length;
  const isRequiredDocsComplete = uploadedRequiredCount === requiredDocTypes.length;
  const isSubmittedOrBeyond =
    activeApplication?.status === 'submitted' ||
    activeApplication?.status === 'verified' ||
    activeApplication?.status === 'revision';
  // Step 3 (Unggah Berkas) tuntas bila berkas wajib lengkap dan telah disubmit
  const isStep3Done = isRequiredDocsComplete && isSubmittedOrBeyond;
  const isStep4Done = activeApplication?.status === 'verified';
  const isStep5Done = Boolean(activeApplication?.decision);

  // Penentuan Tahap Berjalan (Current Step: 1 | 2 | 3 | 4 | 5)
  let currentStep = 1;
  if (!isStep1Done) {
    currentStep = 1;
  } else if (!isStep2Done) {
    currentStep = 2; // Pengisian Biodata
  } else if (!isStep3Done) {
    currentStep = 3; // Unggah Berkas Persyaratan (Sesuai Mockup Referensi)
  } else if (activeApplication?.status === 'submitted' || activeApplication?.status === 'revision') {
    currentStep = 4; // Verifikasi Dokumen oleh Panitia
  } else {
    currentStep = 5; // Pengumuman Hasil Kelulusan & Daftar Ulang
  }

  const stepTitles: Record<number, string> = {
    1: 'Buat Akun',
    2: 'Biodata Diri',
    3: 'Unggah Berkas',
    4: 'Verifikasi Panitia',
    5: 'Pengumuman Kelulusan',
  };

  const stepperConfig = [
    {
      step: 1,
      title: 'Buat Akun',
      menu: 'dashboard',
      date: registrationDate,
    },
    {
      step: 2,
      title: 'Biodata',
      menu: 'biodata',
      date: isStep2Done ? registrationDate : '-',
    },
    {
      step: 3,
      title: 'Unggah Berkas',
      menu: 'berkas',
      date: isStep3Done ? registrationDate : '-',
    },
    {
      step: 4,
      title: 'Verifikasi',
      menu: 'status',
      date: isStep4Done ? registrationDate : '',
    },
    {
      step: 5,
      title: 'Pengumuman',
      menu: 'pengumuman',
      date: isStep5Done ? registrationDate : '',
    },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none bg-slate-50 relative">
      {/* =========================================================================
          FLOATING TOAST NOTIFICATION (Selalu tampil di layar tanpa harus scroll ke atas)
          ========================================================================= */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto shadow-2xl"
        >
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 bg-white backdrop-blur-md ${
              feedbackMessage.type === 'success'
                ? 'border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950 shadow-emerald-500/10'
                : 'border-red-300 ring-2 ring-red-500/20 text-red-950 shadow-red-500/10'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-100 text-[#1E7A46]'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <strong className="block font-bold text-xs">
                {feedbackMessage.type === 'success' ? 'Berhasil' : 'Pemberitahuan'}
              </strong>
              <p className="text-xs text-gray-700 leading-relaxed mt-0.5 break-words">
                {feedbackMessage.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0 -mr-1 -mt-1"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* =========================================================================
          1. HERO SECTION (NAVY #062940 DENGAN SLOGAN RESMI & FOTO GERBANG SEKOLAH)
          ========================================================================= */}
      <section
        aria-labelledby="dashboard-hero-heading"
        className="relative bg-[#062940] text-white overflow-hidden border-b border-white/10 w-full print:hidden"
      >
        <div className="relative w-full min-h-0 lg:min-h-[220px] flex flex-col lg:flex-row lg:items-center">
          {/* Layer Foto Gerbang Resmi SMP Lab UM di Kanan dengan Slogan */}
          <div className="hidden lg:block absolute inset-y-0 right-0 w-[55%] xl:w-[60%] overflow-hidden pointer-events-none select-none">
            <div className="relative w-full h-full">
              <Image
                src="/images/school-gate.jpg"
                alt="SMP Laboratorium UM"
                fill
                priority
                unoptimized
                sizes="60vw"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#062940] via-[#062940]/90 via-20% to-transparent to-55%"
                aria-hidden="true"
              />
              {/* Slogan Resmi SMP Laboratorium UM */}
              <div className="absolute right-12 bottom-8 text-right max-w-xs drop-shadow-md">
                <p className="font-serif italic text-lg xl:text-xl text-white font-medium tracking-wide leading-snug">
                  Bersama Membangun Generasi Berkarakter &amp; Berprestasi
                </p>
              </div>
            </div>
          </div>

          {/* Konten Teks Hero (Mobile & Desktop) */}
          <div className="relative z-10 w-full lg:w-[48%] xl:w-[44%] px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-8 pb-7 lg:py-8">
            <div className="max-w-xl space-y-2.5">
              {/* Breadcrumb Navigation */}
              <nav aria-label="Navigasi Halaman">
                <ol className="flex items-center gap-2 text-xs text-white/70">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Beranda
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-white/40">&gt;</li>
                  <li>
                    <Link href="/ppdb" className="hover:text-white transition-colors">
                      PPDB
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-white/40">&gt;</li>
                  <li aria-current="page" className="font-semibold text-white">
                    Dashboard
                  </li>
                </ol>
              </nav>

              {/* Badge Emas */}
              <div className="inline-flex items-center gap-1.5 bg-[#C89332] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                <span>PPDB Online 2026/2027</span>
              </div>

              <div>
                <h1
                  id="dashboard-hero-heading"
                  className="font-pub-heading text-2xl sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight leading-tight"
                >
                  Dashboard Pendaftar
                </h1>
                <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed">
                  Pantau progres pendaftaran Anda dan lengkapi berkas sesuai dengan tahapan yang tersedia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. KONTEN UTAMA: 3 KOLOM RESPONSIVE (100% SESUAI MOCKUP REFERENSI)
          ========================================================================= */}
      <section className="py-8 sm:py-10 w-full print:py-0">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ===================================================================
                KOLOM 1: SIDEBAR KIRI (Span 3 / 12)
                Profil Singkat + Menu Navigasi + Kotak Kontak Resmi Panitia
                =================================================================== */}
            <div className="lg:col-span-3 space-y-5 print:hidden">
              {/* Kartu Profil Singkat Calon Siswa (Faktual) */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#062940] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[#062940] truncate leading-tight">
                    {studentName}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono truncate mt-0.5">
                    {regNo}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[#1E7A46] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E7A46]"></span>
                    <span>Aktif</span>
                  </span>
                </div>
              </div>

              {/* Daftar Menu Navigasi Sidebar */}
              <nav aria-label="Menu Dashboard" className="bg-white border border-gray-200/90 rounded-2xl p-3 shadow-xs space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: School },
                  { id: 'biodata', label: 'Biodata', icon: User },
                  { id: 'orang_tua', label: 'Orang Tua', icon: Users },
                  { id: 'berkas', label: 'Unggah Dokumen', icon: Upload },
                  { id: 'status', label: 'Status Pendaftaran', icon: FileCheck },
                  { id: 'kartu', label: 'Kartu Peserta', icon: CreditCard },
                  { id: 'pengumuman', label: 'Pengumuman', icon: Bell },
                  { id: 'faq', label: 'Panduan & FAQ', icon: HelpCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#C89332] ${isActive
                          ? 'bg-[#062940] text-white shadow-2xs'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-[#062940]'
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Kotak Butuh Bantuan Resmi */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#062940] text-white flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h4 className="font-bold text-xs text-[#062940]">Butuh Bantuan?</h4>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Hubungi sekretariat panitia PPDB SMP Laboratorium UM melalui WhatsApp atau telepon kantor:
                </p>

                <div className="space-y-2 text-xs pt-1 border-t border-gray-100">
                  <div className="flex items-start gap-2.5 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-[#E8F5E9] text-[#1E7A46] flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-bold block text-xs">0851-2608-8473</span>
                      <span className="text-[10px] text-gray-400 block">(08.00 - 15.30 WIB)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-[#EBF3F8] text-[#0A3D62] flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-bold block text-xs">(0341) 588550</span>
                      <span className="text-[10px] text-gray-400 block">(Tata Usaha)</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://wa.me/6285126088473?text=Halo%20Panitia%20PPDB%20SMP%20Laboratorium%20UM,%20saya%20butuh%20bantuan%20seputar%20pendaftaran%20online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1E7A46] hover:bg-[#165c34] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xs transition-colors"
                >
                  <span>Chat WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* ===================================================================
                KOLOM 2: AREA UTAMA TENGAH (Span 6 / 12)
                Status Pendaftaran + Stepper 5 Tahap + Dokumen / Form Aktif
                =================================================================== */}
            <div className="lg:col-span-6 space-y-6">
              {/* 1. KARTU STATUS PENDAFTARAN (DINAMIS DARI DATA BACKEND) */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#1E7A46] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          Status Pendaftaran
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0A3D62] bg-[#EBF3F8] px-2.5 py-0.5 rounded-full">
                          <span>Tahap {currentStep} dari 5</span>
                          <span className="w-1 h-1 rounded-full bg-[#0A3D62]" />
                          <span>{stepTitles[currentStep]}</span>
                        </span>
                      </div>
                      <h2 className="font-pub-heading text-xl sm:text-2xl font-bold text-[#062940]">
                        {activeApplication?.decision === 'diterima'
                          ? 'Diterima di SMP Lab UM'
                          : activeApplication?.decision === 'cadangan'
                            ? 'Daftar Cadangan (Waitlist)'
                            : activeApplication?.status === 'revision'
                              ? 'Perlu Revisi Dokumen'
                              : activeApplication?.status === 'submitted'
                                ? 'Menunggu Verifikasi Panitia'
                                : activeApplication?.status === 'verified'
                                  ? 'Berkas Terverifikasi'
                                  : currentStep === 2
                                    ? 'Pengisian Biodata'
                                    : 'Dalam Proses'}
                      </h2>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                        {activeApplication?.decision === 'diterima'
                          ? 'Selamat! Anda dinyatakan lolos seleksi. Silakan ikuti instruksi daftar ulang di bawah ini.'
                          : activeApplication?.status === 'submitted'
                            ? 'Formulir Anda telah terkirim. Panitia sedang memeriksa kelengkapan dan keabsahan berkas.'
                            : activeApplication?.status === 'revision'
                              ? 'Terdapat catatan perbaikan dokumen dari panitia. Silakan periksa tab Status Pendaftaran dan perbarui berkas.'
                              : currentStep === 2
                                ? 'Akun pendaftaran Anda telah aktif. Silakan lengkapi data pribadi dan data orang tua untuk melanjutkan.'
                                : 'Terima kasih telah melakukan pendaftaran. Silakan lengkapi data dan unggah berkas sesuai tahapan berikut.'}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 text-xs">
                    <span className="text-gray-400 block text-[11px]">No. Pendaftaran</span>
                    <strong className="text-gray-900 font-mono text-xs sm:text-sm block">{regNo}</strong>
                    <span className="text-gray-400 block text-[11px] mt-1.5">Tanggal Terdaftar</span>
                    <span className="text-gray-700 text-[11px] font-medium block">
                      {registrationDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. KARTU TAHAPAN PENDAFTARAN (STEPPER REAL STATUS) */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs print:hidden">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-pub-heading font-bold text-sm text-[#062940]">
                    Tahapan Pendaftaran
                  </h3>
                  <span className="text-[11px] font-semibold text-gray-500">
                    Posisi: <strong className="text-[#062940]">Tahap {currentStep} ({stepTitles[currentStep]})</strong>
                  </span>
                </div>

                <div className="relative">
                  {/* Garis Penghubung Presisi 4 Segmen Sesuai Progres Riil */}
                  <div className="hidden sm:grid grid-cols-4 absolute top-4 left-[10%] right-[10%] -z-0">
                    <div className={`h-0.5 transition-colors duration-300 ${currentStep > 1 ? 'bg-[#1E7A46]' : 'bg-gray-200'}`} />
                    <div className={`h-0.5 transition-colors duration-300 ${currentStep > 2 ? 'bg-[#1E7A46]' : 'bg-gray-200'}`} />
                    <div className={`h-0.5 transition-colors duration-300 ${currentStep > 3 ? 'bg-[#1E7A46]' : 'bg-gray-200'}`} />
                    <div className={`h-0.5 transition-colors duration-300 ${currentStep > 4 ? 'bg-[#1E7A46]' : 'bg-gray-200'}`} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10 text-center">
                    {stepperConfig.map((item) => {
                      const isDone = item.step < currentStep;
                      const isCurrent = item.step === currentStep;

                      return (
                        <button
                          key={item.step}
                          type="button"
                          onClick={() => setActiveMenu(item.menu)}
                          className="space-y-1.5 flex flex-col items-center group focus:outline-none transition-transform hover:-translate-y-0.5"
                          title={`Klik untuk membuka tahapan ${item.title}`}
                        >
                          {/* Lingkaran Indikator */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${isDone
                                ? 'bg-[#1E7A46] text-white'
                                : isCurrent
                                  ? 'bg-[#062940] text-white ring-4 ring-[#EBF3F8]'
                                  : 'bg-white border-2 border-gray-200 text-gray-400 group-hover:border-gray-300'
                              }`}
                          >
                            {isDone ? (
                              <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                            ) : (
                              <span>{item.step}</span>
                            )}
                          </div>

                          {/* Nama Langkah */}
                          <span
                            className={`text-xs font-bold block transition-colors ${isCurrent ? 'text-[#062940]' : isDone ? 'text-gray-800' : 'text-gray-500'
                              } group-hover:text-[#062940]`}
                          >
                            {item.title}
                          </span>

                          {/* Status Badge */}
                          {isDone ? (
                            <span className="text-[10px] font-semibold text-[#1E7A46] block">
                              Selesai
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block text-[#0A3D62] bg-[#EBF3F8]">
                              Dalam Proses
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-gray-400 block">
                              Menunggu
                            </span>
                          )}

                          {/* Tanggal / Subketerangan */}
                          <span className="text-[10px] text-gray-400 block">
                            {isDone
                              ? item.date
                              : isCurrent && item.step === 3
                                ? `${uploadedRequiredCount}/4 Berkas`
                                : isCurrent
                                  ? '-'
                                  : '-'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. TAMPILAN BERDASARKAN MENU YANG DIPILIH */}

              {/* VIEW: UNGGAH DOKUMEN (Aktif saat menu berkas dipilih atau saat pendaftar berada di Tahap 3) */}
              {(activeMenu === 'berkas' || (activeMenu === 'dashboard' && currentStep === 3)) && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-5 print:hidden">
                  <div>
                    {currentStep === 3 && activeMenu === 'dashboard' && (
                      <span className="text-[11px] font-bold text-[#0A3D62] bg-[#EBF3F8] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                        Tahap 3 dari 5 &bull; Unggah Berkas Persyaratan
                      </span>
                    )}
                    <h3 className="font-pub-heading font-bold text-base text-[#062940]">
                      Unggah Dokumen
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pastikan file yang diunggah sesuai dengan ketentuan resmi (format PDF/JPG/PNG, maks. 2MB).
                    </p>
                  </div>

                  {/* Daftar Dokumen Unggahan */}
                  <div className="space-y-3">
                    {documentsConfig.map((doc) => {
                      const uploaded = activeApplication?.documents?.find((d) => d.document_type === doc.type);
                      const isUploading = isUploadingDoc === doc.type;
                      const Icon = doc.icon;

                      return (
                        <div
                          key={doc.type}
                          className="p-3.5 sm:p-4 rounded-xl border border-gray-200/90 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-xs sm:text-sm">{doc.label}</span>
                                {doc.req && <span className="text-red-500 font-bold">*</span>}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">{doc.desc}</p>
                              {uploaded?.reject_reason && (
                                <p className="text-red-600 text-[11px] font-semibold mt-1">
                                  Catatan Panitia: &quot;{uploaded.reject_reason}&quot;
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                            {/* Status Badge Dokumen */}
                            {uploaded ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E7A46] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Terunggah</span>
                              </span>
                            ) : isUploading ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A3D62] bg-[#EBF3F8] px-2.5 py-1 rounded-full">
                                <RotateCw className="w-3 h-3 animate-spin" />
                                <span>Proses Unggah</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                Belum Diunggah
                              </span>
                            )}

                            {/* Tombol Aksi */}
                            {uploaded ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => alert(`Dokumen ${doc.label} telah tersimpan di server admisi PPDB.`)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 bg-white text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
                                >
                                  <span>Lihat File</span>
                                </button>
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDocument(uploaded.id, doc.label)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md"
                                    title="Hapus berkas"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-[#C89332] bg-white text-xs font-semibold text-gray-700 hover:text-[#C89332] transition-colors shadow-2xs">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Unggah File</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(doc.type, file);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW: BIODATA (Aktif saat menu biodata dipilih atau saat dashboard di Tahap 2) */}
              {(activeMenu === 'biodata' || (activeMenu === 'dashboard' && currentStep === 2)) && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-5 print:hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      {currentStep === 2 && activeMenu === 'dashboard' && (
                        <span className="text-[11px] font-bold text-[#0A3D62] bg-[#EBF3F8] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                          Tahap 2 dari 5 &bull; Pengisian Biodata Calon Siswa
                        </span>
                      )}
                      <h3 className="font-pub-heading font-bold text-base text-[#062940]">
                        Biodata Calon Peserta Didik
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pilih jalur pendaftaran dan lengkapi data diri calon siswa di bawah ini untuk melanjutkan ke tahap unggah berkas.
                      </p>
                    </div>
                    {!isLocked && (
                      <button
                        onClick={handleSaveActiveSection}
                        disabled={saveStepMutation.isPending || createApplicationMutation.isPending}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#062940] hover:bg-[#0A3D62] px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saveStepMutation.isPending || createApplicationMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                      </button>
                    )}
                  </div>

                  {/* PILIHAN JALUR PENDAFTARAN */}
                  <div className="bg-[#FAFBFD] border border-blue-100/90 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div>
                        <label className="block font-bold text-xs text-[#062940]">
                          Pilihan Jalur Pendaftaran *
                        </label>
                        <p className="text-[11px] text-gray-500">
                          Pilih salah satu jalur penerimaan peserta didik baru yang sesuai dengan kriteria calon siswa.
                        </p>
                      </div>
                      {(activeWave || publicWaves[0]) && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF3F8] text-[#0A3D62] self-start sm:self-auto">
                          <Calendar className="w-3.5 h-3.5 text-[#0A3D62]" />
                          <span>{activeWave?.name || publicWaves[0]?.name || 'Gelombang 1'} (Sedang Dibuka)</span>
                        </span>
                      )}
                    </div>

                    {/* Grid Pilihan Jalur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      {tracks.length > 0 ? (
                        tracks.map((t) => {
                          const isSelected = choiceData.track_id === t.id;
                          const icon =
                            t.code === 'prestasi'
                              ? Trophy
                              : t.code === 'afirmasi'
                                ? HeartHandshake
                                : t.code === 'tahfidz'
                                  ? BookCheck
                                  : GraduationCap;
                          const IconComp = icon;

                          return (
                            <button
                              key={t.id}
                              type="button"
                              disabled={isLocked}
                              onClick={() => {
                                setChoiceData((prev) => ({
                                  ...prev,
                                  track_id: t.id,
                                  wave_id: t.wave_id || choiceData.wave_id || activeWave?.id || publicWaves[0]?.id || '',
                                }));
                              }}
                              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${isSelected
                                  ? 'border-[#062940] bg-white ring-2 ring-[#062940]/15 shadow-xs'
                                  : 'border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                                } ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#062940] text-white' : 'bg-gray-100 text-gray-600'
                                      }`}
                                  >
                                    <IconComp className="w-4 h-4" />
                                  </div>
                                  {isSelected && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      <Check className="w-3 h-3 stroke-[3]" /> Dipilih
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-xs text-[#062940] leading-tight">
                                  {t.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-1">
                                  Kuota: <span className="font-semibold text-gray-700">{t.quota} Calon Siswa</span>
                                </p>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="sm:col-span-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>Memuat daftar jalur pendaftaran resmi...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Siswa</label>
                      <input
                        type="text"
                        value={personalData.full_name}
                        onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })}
                        disabled={isLocked}
                        placeholder="Contoh: Nama Sesuai Akta"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">NIK (16 Digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={personalData.nik}
                        onChange={(e) => setPersonalData({ ...personalData, nik: e.target.value })}
                        disabled={isLocked}
                        placeholder="16 Digit NIK"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">NISN (10 Digit)</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={personalData.nisn}
                        onChange={(e) => setPersonalData({ ...personalData, nisn: e.target.value })}
                        disabled={isLocked}
                        placeholder="10 Digit NISN"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={personalData.birth_place}
                        onChange={(e) => setPersonalData({ ...personalData, birth_place: e.target.value })}
                        disabled={isLocked}
                        placeholder="Kota / Kabupaten Lahir"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={personalData.birth_date}
                        onChange={(e) => setPersonalData({ ...personalData, birth_date: e.target.value })}
                        disabled={isLocked}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                      <select
                        value={personalData.gender}
                        onChange={(e) => setPersonalData({ ...personalData, gender: e.target.value })}
                        disabled={isLocked}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-[#C89332]"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-gray-700 mb-1">Alamat Tempat Tinggal Lengkap</label>
                      <textarea
                        rows={2}
                        value={personalData.address}
                        onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                        disabled={isLocked}
                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                  </div>

                  {/* Tombol Lanjut ke Tahap Berikutnya */}
                  {!isLocked && (
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-[11px] text-gray-500">
                        Pastikan Nama Lengkap dan NIK (16 digit) sesuai dengan Kartu Keluarga / Akta Kelahiran.
                      </p>
                      <button
                        type="button"
                        onClick={handleSaveActiveSection}
                        disabled={saveStepMutation.isPending || createApplicationMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#062940] hover:bg-[#0A3D62] text-white font-bold text-xs shadow-2xs transition-colors shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan &amp; Lanjut ke Tahap 3 (Unggah Berkas)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: ORANG TUA */}
              {activeMenu === 'orang_tua' && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-4 print:hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="font-pub-heading font-bold text-base text-[#062940]">
                      Data Orang Tua / Wali
                    </h3>
                    {!isLocked && (
                      <button
                        onClick={handleSaveActiveSection}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#062940] hover:bg-[#0A3D62] px-3.5 py-1.5 rounded-xl transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Nama Ayah Kandung</label>
                      <input
                        type="text"
                        value={parentData.father_name}
                        onChange={(e) => setParentData({ ...parentData, father_name: e.target.value })}
                        disabled={isLocked}
                        placeholder="Nama Lengkap Ayah"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        value={parentData.father_job}
                        onChange={(e) => setParentData({ ...parentData, father_job: e.target.value })}
                        disabled={isLocked}
                        placeholder="Pekerjaan Ayah"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Nama Ibu Kandung</label>
                      <input
                        type="text"
                        value={parentData.mother_name}
                        onChange={(e) => setParentData({ ...parentData, mother_name: e.target.value })}
                        disabled={isLocked}
                        placeholder="Nama Lengkap Ibu"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={parentData.mother_job}
                        onChange={(e) => setParentData({ ...parentData, mother_job: e.target.value })}
                        disabled={isLocked}
                        placeholder="Pekerjaan Ibu"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">No. WhatsApp Orang Tua</label>
                      <input
                        type="tel"
                        value={parentData.father_phone || parentData.mother_phone}
                        onChange={(e) => setParentData({ ...parentData, father_phone: e.target.value })}
                        disabled={isLocked}
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#C89332]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Penghasilan Keluarga</label>
                      <select
                        value={parentData.income_range}
                        onChange={(e) => setParentData({ ...parentData, income_range: e.target.value })}
                        disabled={isLocked}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-[#C89332]"
                      >
                        <option value="< 3 Juta">&lt; Rp 3.000.000 / bulan</option>
                        <option value="3 - 7 Juta">Rp 3.000.000 - Rp 7.000.000 / bulan</option>
                        <option value="7 - 15 Juta">Rp 7.000.000 - Rp 15.000.000 / bulan</option>
                        <option value="> 15 Juta">&gt; Rp 15.000.000 / bulan</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: KARTU PESERTA */}
              {activeMenu === 'kartu' && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-4 print:hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="font-pub-heading font-bold text-base text-[#062940]">
                      Kartu Tanda Peserta PPDB
                    </h3>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#C89332] hover:bg-[#B57C23] px-4 py-2 rounded-xl transition-colors shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Sekarang</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Kartu tanda peserta resmi ini memuat nomor pendaftaran resmi Anda ({regNo}). Harap dicetak dan dibawa saat jadwal verifikasi fisik atau proses daftar ulang di sekretariat sekolah.
                  </p>
                </div>
              )}

              {/* VIEW: STATUS PENDAFTARAN (Aktif saat menu status dipilih atau saat pendaftar di Tahap 4) */}
              {(activeMenu === 'status' || (activeMenu === 'dashboard' && currentStep === 4)) && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-6 print:hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-pub-heading font-bold text-base text-[#062940]">
                        Status &amp; Verifikasi Pendaftaran
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pantau proses validasi berkas dan keabsahan dokumen oleh panitia admisi.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF3F8] text-[#0A3D62] self-start sm:self-auto">
                      <span>Tahap {currentStep}: {stepTitles[currentStep]}</span>
                    </span>
                  </div>

                  {/* Ringkasan Data Registrasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-xl border border-gray-200/70 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Nomor Registrasi</span>
                      <strong className="text-gray-900 font-mono font-bold">{regNo}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Jalur Pilihan</span>
                      <strong className="text-gray-900">{activeApplication?.track?.name || 'Jalur Reguler'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Gelombang Masuk</span>
                      <strong className="text-gray-900">{activeApplication?.wave?.name || activeWave?.name || 'Gelombang 1'}</strong>
                    </div>
                  </div>

                  {/* Peringatan Status Tertentu */}
                  {activeApplication?.status === 'revision' && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Perlu Revisi Dokumen Berkas</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Terdapat berkas yang belum memenuhi syarat atau perlu diperjelas. Silakan periksa daftar dokumen di tab <strong>Unggah Dokumen</strong> dan unggah ulang berkas yang diminta.
                      </p>
                    </div>
                  )}

                  {activeApplication?.status === 'submitted' && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                      <Clock className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Menunggu Verifikasi Dokumen</strong>
                        <p className="text-[11px] leading-relaxed mt-0.5">
                          Formulir dan berkas Anda telah berhasil diserahkan pada panitia admisi. Proses verifikasi dokumen fisik dan digital memerlukan waktu 1–2 hari kerja.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeApplication?.status === 'verified' && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Seluruh Berkas Valid &amp; Terverifikasi</strong>
                        <p className="text-[11px] leading-relaxed mt-0.5">
                          Panitia telah memvalidasi seluruh berkas Anda. Anda berhak mengikuti tahapan pemetaan/seleksi berikutnya dan menunggu pengumuman kelulusan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Checklist Kelengkapan Dokumen */}
                  <div>
                    <h4 className="font-bold text-xs text-[#062940] mb-3">
                      Daftar Status Berkas Pendaftaran
                    </h4>
                    <div className="space-y-2">
                      {documentsConfig.map((doc) => {
                        const uploaded = activeApplication?.documents?.find((d) => d.document_type === doc.type);
                        const isUploaded = Boolean(uploaded && uploaded.status !== 'ditolak');
                        const isRejected = uploaded?.status === 'ditolak';

                        return (
                          <div
                            key={doc.type}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-slate-50/50 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${isRejected
                                    ? 'bg-red-500'
                                    : isUploaded
                                      ? 'bg-[#1E7A46]'
                                      : 'bg-gray-300'
                                  }`}
                              >
                                {isRejected ? <X className="w-3.5 h-3.5" /> : isUploaded ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 block">{doc.label}</span>
                                <span className="text-[10px] text-gray-400 block">{doc.desc}</span>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${isRejected
                                  ? 'bg-red-100 text-red-700'
                                  : isUploaded
                                    ? 'bg-[#E8F5E9] text-[#1E7A46]'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                              {isRejected ? 'Perlu Revisi' : isUploaded ? 'Terunggah' : 'Belum Ada'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aksi Final Submit jika status masih draft */}
                  {activeApplication?.status === 'draft' && (
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-[11px] text-gray-500">
                        {isRequiredDocsComplete
                          ? 'Semua berkas wajib telah lengkap. Klik tombol di kanan untuk mengirim formulir ke panitia.'
                          : `Masih ada ${requiredDocTypes.length - uploadedRequiredCount} berkas wajib yang belum terunggah.`}
                      </p>
                      <button
                        onClick={() => setIsSubmitModalOpen(true)}
                        disabled={!isRequiredDocsComplete || submitApplicationMutation.isPending}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#062940] hover:bg-[#0A3D62] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-2xs shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Formulir Final</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: PENGUMUMAN KELULUSAN (Aktif saat menu pengumuman dipilih atau saat pendaftar di Tahap 5) */}
              {(activeMenu === 'pengumuman' || (activeMenu === 'dashboard' && currentStep === 5)) && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-6 print:hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-pub-heading font-bold text-base text-[#062940]">
                        Pengumuman Hasil Seleksi PPDB
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tahun Ajaran 2026/2027 SMP Laboratorium Universitas Negeri Malang
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">No: {regNo}</span>
                  </div>

                  {/* Skenario 1: DITERIMA */}
                  {activeApplication?.decision === 'diterima' && (
                    <div className="p-6 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1E7A46] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <GraduationCap className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <span className="inline-block text-[11px] font-bold text-[#1E7A46] uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full shadow-2xs">
                            Selamat! Anda Lolos Seleksi
                          </span>
                          <h4 className="font-pub-heading text-lg sm:text-xl font-bold text-[#062940]">
                            Diterima Sebagai Calon Siswa Baru
                          </h4>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Berdasarkan hasil verifikasi berkas dan tes pemetaan, calon siswa atas nama <strong>{studentName}</strong> dinyatakan DITERIMA pada jalur <strong>{activeApplication?.track?.name || 'Reguler'}</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-[#A5D6A7] text-xs space-y-2">
                        <strong className="block font-bold text-gray-800">Petunjuk Daftar Ulang:</strong>
                        <ul className="space-y-1 text-gray-600 list-disc list-inside text-[11px]">
                          <li>Jadwal Daftar Ulang: <strong>08 &ndash; 12 Juni 2026</strong> (08.00 &ndash; 14.00 WIB)</li>
                          <li>Lokasi: Sekretariat PPDB Kampus SMP Laboratorium UM, Jl. Simpang Bogor No. T-7 Malang</li>
                          <li>Membawa cetak Kartu Tanda Peserta dan dokumen asli (KK &amp; Akta Kelahiran)</li>
                        </ul>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={() => setActiveMenu('kartu')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E7A46] hover:bg-[#165c34] text-white text-xs font-bold shadow-2xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Bukti Kelulusan / Kartu Peserta</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Skenario 2: CADANGAN */}
                  {activeApplication?.decision === 'cadangan' && (
                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                      <div className="flex items-center gap-3 text-amber-800 font-bold text-base">
                        <Clock className="w-5 h-5 shrink-0" />
                        <span>Status: Terdaftar Cadangan (Waitlist)</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Calon siswa atas nama <strong>{studentName}</strong> berada pada daftar tunggu kuota jalur <strong>{activeApplication?.track?.name || 'Reguler'}</strong>. Panitia admisi akan menghubungi Anda apabila terdapat kuota yang tidak diambil pada masa daftar ulang.
                      </p>
                    </div>
                  )}

                  {/* Skenario 3: BELUM LOLOS / DITOLAK */}
                  {activeApplication?.decision === 'ditolak' && (
                    <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
                      <h4 className="font-bold text-gray-800 text-sm">Hasil Seleksi PPDB</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Terima kasih atas partisipasi Anda dalam seleksi Penerimaan Peserta Didik Baru SMP Laboratorium UM. Mohon maaf, berdasarkan kuota rombel yang tersedia, Anda belum dapat diterima pada periode ini.
                      </p>
                    </div>
                  )}

                  {/* Skenario 4: BELUM WAKTU PENGUMUMAN */}
                  {!activeApplication?.decision && (
                    <div className="p-6 rounded-2xl bg-[#EBF3F8] border border-[#D0E2ED] text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#0A3D62] text-white flex items-center justify-center mx-auto shadow-xs">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-pub-heading text-base font-bold text-[#062940]">
                          Pengumuman Hasil Seleksi Belum Dibuka
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
                          Sesuai jadwal resmi, hasil kelulusan seleksi PPDB Gelombang 1 akan dipublikasikan secara serentak pada:
                        </p>
                        <div className="inline-block mt-3 px-4 py-2 bg-white rounded-xl border border-gray-200 font-bold text-sm text-[#062940] shadow-2xs font-mono">
                          05 Juni 2026 &bull; Pukul 10.00 WIB
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                        Hasil seleksi dapat dipantau langsung melalui akun dashboard ini atau widget Cek Hasil Mandiri pada halaman utama PPDB.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: PANDUAN & FAQ */}
              {activeMenu === 'faq' && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-6 print:hidden">
                  <div className="pb-4 border-b border-gray-100">
                    <h3 className="font-pub-heading font-bold text-base text-[#062940]">
                      Panduan Pendaftaran &amp; FAQ
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Informasi resmi seputar syarat, tata cara unggah berkas, dan layanan PPDB.
                    </p>
                  </div>

                  {/* Tanya Jawab Akordeon */}
                  <div className="space-y-3">
                    {[
                      {
                        q: 'Apa saja berkas wajib yang harus diunggah?',
                        a: 'Berkas wajib meliputi Kartu Keluarga (KK), Akta Kelahiran, Pas Foto formal 3x4 (latar merah/biru), dan scan Nilai Rapor SD/MI semester 7 s/d 11 yang telah dilegalisir kepala sekolah asal.',
                      },
                      {
                        q: 'Bagaimana jika berkas yang saya unggah buram atau salah file?',
                        a: 'Selama status formulir Anda masih Draf, Anda dapat menghapus berkas kapan saja dan mengunggah file baru. Jika formulir telah dikirim dan ada berkas yang kurang jelas, panitia akan memberikan status "Perlu Revisi" dan membuka akses unggah ulang.',
                      },
                      {
                        q: 'Apakah pendaftaran Jalur Prestasi memerlukan tes tulis akademik?',
                        a: 'Tidak. Jalur Prestasi mendapatkan keistimewaan bebas tes tulis akademik dan diseleksi langsung berdasarkan peringkat kejuaraan resmi (OSN, O2SN, FLS2N, kejuaraan olahraga/seni) yang dibuktikan dengan piagam/sertifikat.',
                      },
                      {
                        q: 'Kapan jadwal verifikasi berkas fisik dan daftar ulang dilakukan?',
                        a: 'Verifikasi berkas fisik dilakukan bersamaan dengan proses daftar ulang siswa baru pada tanggal 08 – 12 Juni 2026 di sekretariat PPDB kampus SMP Laboratorium UM.',
                      },
                    ].map((item, idx) => (
                      <details
                        key={idx}
                        className="group rounded-xl border border-gray-200 bg-slate-50/60 p-3.5 text-xs transition-colors open:bg-white open:border-[#0A3D62]/40"
                      >
                        <summary className="font-bold text-gray-800 cursor-pointer list-none flex items-center justify-between gap-2">
                          <span>{item.q}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform shrink-0" />
                        </summary>
                        <p className="text-gray-600 text-[11px] leading-relaxed mt-2 pt-2 border-t border-gray-100">
                          {item.a}
                        </p>
                      </details>
                    ))}
                  </div>

                  {/* Unduhan Dokumen Resmi */}
                  <div className="pt-2">
                    <h4 className="font-bold text-xs text-[#062940] mb-3">
                      Dokumen Resmi PPDB untuk Diunduh
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'Brosur & Panduan PPDB 2026', size: 'PDF (2.4 MB)' },
                        { name: 'Format Surat Pernyataan Siswa', size: 'PDF (350 KB)' },
                        { name: 'Tata Tertib Penerimaan Siswa', size: 'PDF (520 KB)' },
                      ].map((d, i) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-200 bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <strong className="block text-gray-800 text-[11px] leading-tight">{d.name}</strong>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{d.size}</span>
                          </div>
                          <a
                            href="#unduh"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Dokumen resmi dapat diunduh melalui sekretariat sekolah atau tautan PPDB.');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-gray-200 text-[#0A3D62] hover:text-[#C89332] shadow-2xs"
                            title="Unduh dokumen"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. BANNER BAWAH: CEK STATUS PENDAFTARAN */}
              <div className="bg-[#EBF3F8]/70 border border-[#D0E2ED] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#062940] text-white flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#062940]">
                      Cek Status Pendaftaran
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Anda dapat memantau status pendaftaran kapan saja secara transparan melalui dashboard ini.
                    </p>
                    <button
                      onClick={() => setActiveMenu('status')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A3D62] hover:text-[#C89332] mt-1.5"
                    >
                      <span>Lihat Detail Status</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3 text-right">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#D0E2ED] text-[#0A3D62] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-[#0A3D62]" />
                  </div>
                  <p className="font-serif italic text-xs text-gray-600 max-w-[200px] leading-snug">
                    &ldquo;Langkah kecil hari ini, untuk masa depan yang lebih besar.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* ===================================================================
                KOLOM 3: SIDEBAR KANAN (Span 3 / 12)
                Informasi Gelombang + Jalur Pendaftaran + Dokumen Panduan
                =================================================================== */}
            <div className="lg:col-span-3 space-y-5 print:hidden">
              {/* KARTU 1: INFORMASI GELOMBANG RESMI */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF3F8] text-[#0A3D62] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#062940]">Informasi Pendaftaran</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#0A3D62] bg-[#EBF3F8] px-2.5 py-0.5 rounded-full">
                    {activeWave?.name || 'Gelombang 1'}
                  </span>
                  <span className="text-[10px] font-bold text-[#1E7A46] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                    Sedang Dibuka
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-gray-900">Reguler &amp; Prestasi</h5>
                  <p className="text-[11px] text-gray-500">Tahun Ajaran 2026/2027</p>
                </div>

                {/* Timeline Vertikal Node */}
                <div className="relative pl-5 border-l border-gray-200 space-y-3 text-[11px] pt-1">
                  <div className="relative">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-[#0A3D62] bg-white absolute -left-[26px] top-1" />
                    <span className="font-bold text-gray-800 block">Masa Pendaftaran</span>
                    <span className="text-gray-500 text-[10px] block">01 Mei &ndash; 30 Mei 2026</span>
                  </div>

                  <div className="relative">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white absolute -left-[26px] top-1" />
                    <span className="font-bold text-gray-800 block">Batas Verifikasi Berkas</span>
                    <span className="text-gray-500 text-[10px] block">02 Juni 2026</span>
                  </div>

                  <div className="relative">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white absolute -left-[26px] top-1" />
                    <span className="font-bold text-gray-800 block">Pengumuman Kelulusan</span>
                    <span className="text-gray-500 text-[10px] block">05 Juni 2026</span>
                  </div>

                  <div className="relative">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white absolute -left-[26px] top-1" />
                    <span className="font-bold text-gray-800 block">Daftar Ulang &amp; Verifikasi Fisik</span>
                    <span className="text-gray-500 text-[10px] block">08 Juni &ndash; 12 Juni 2026</span>
                  </div>
                </div>

                <Link
                  href="/ppdb#jadwal"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A3D62] hover:text-[#C89332] pt-1 transition-colors"
                >
                  <span>Lihat Detail Jadwal</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* KARTU 2: JALUR PENDAFTARAN RESMI */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-[#062940]">Jalur Pendaftaran</h4>

                <div className="space-y-2">
                  {[
                    { name: 'Reguler', quota: 'Kuota 60% Rombel', icon: GraduationCap },
                    { name: 'Prestasi', quota: 'Kuota 20% Rombel', icon: Trophy },
                    { name: 'Afirmasi', quota: 'Kuota 15% Rombel', icon: HeartHandshake },
                    { name: "Tahfidz Qur'an", quota: 'Kuota 5% Rombel', icon: BookCheck },
                  ].map((j, i) => {
                    const JIcon = j.icon;
                    return (
                      <Link
                        key={i}
                        href="/ppdb#jalur"
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-gray-100 text-[#062940] flex items-center justify-center shrink-0">
                            <JIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-gray-800 block group-hover:text-[#062940]">
                              {j.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block">{j.quota}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#062940] transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/ppdb#jalur"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A3D62] hover:text-[#C89332] pt-1 transition-colors"
                >
                  <span>Lihat Detail Jalur</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* KARTU 3: DOKUMEN PANDUAN PPDB */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#062940]" />
                  <h4 className="font-bold text-xs text-[#062940]">Dokumen Panduan</h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { title: 'Panduan Pendaftaran', sub: 'Format Informasi PPDB' },
                    { title: 'Contoh Formulir Biodata', sub: 'Ketentuan Isian Berkas' },
                    { title: 'Tata Tertib PPDB SMP Lab', sub: 'Pedoman Kelulusan' },
                  ].map((pdf, idx) => (
                    <Link
                      key={idx}
                      href="/ppdb#persyaratan"
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-[#062940] text-white flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-gray-800 block">{pdf.title}</span>
                          <span className="text-[10px] text-gray-400 block">{pdf.sub}</span>
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#062940]" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. LEMBAR CETAK RESMI (PRINT ONLY - KARTU PESERTA PPDB KOP RESMI SEKOLAH)
          ========================================================================= */}
      <section className="hidden print:block p-8 bg-white text-black font-sans">
        <div className="border-b-2 border-black pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative">
              <Image src="/images/logo-um.png" alt="Logo UM" width={64} height={64} className="object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase">P2LP Universitas Negeri Malang</h2>
              <h1 className="text-lg font-bold uppercase">SMP Laboratorium Universitas Negeri Malang</h1>
              <p className="text-xs text-gray-700">Jl. Simpang Bogor No. T-7, Sumbersari, Lowokwaru, Kota Malang | Telp: (0341) 588550</p>
            </div>
          </div>
        </div>

        <div className="text-center my-6">
          <h2 className="text-base font-bold uppercase underline">
            KARTU TANDA BUKTI PENDAFTARAN PPDB T.A. 2026/2027
          </h2>
          <p className="text-xs font-mono font-bold mt-1">
            NOMOR PENDAFTARAN: {regNo}
          </p>
        </div>

        <table className="w-full text-xs border border-collapse border-black mb-6">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/3 p-2 font-semibold bg-gray-100 border-r border-black">Nama Lengkap Siswa</td>
              <td className="p-2 font-bold">{studentName}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-semibold bg-gray-100 border-r border-black">Nomor Induk Kependudukan (NIK)</td>
              <td className="p-2 font-mono">{personalData.nik || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-semibold bg-gray-100 border-r border-black">NISN</td>
              <td className="p-2 font-mono">{personalData.nisn || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-semibold bg-gray-100 border-r border-black">Tempat, Tanggal Lahir</td>
              <td className="p-2">{personalData.birth_place || '-'}, {personalData.birth_date || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-semibold bg-gray-100 border-r border-black">Pilihan Jalur Masuk</td>
              <td className="p-2 font-bold">
                {activeApplication?.track?.name || 'Jalur Reguler'}
              </td>
            </tr>
            <tr>
              <td className="p-2 font-semibold bg-gray-100 border-r border-black">Status Berkas Pendaftaran</td>
              <td className="p-2 font-bold uppercase">{activeApplication?.status || 'Dalam Proses'}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 text-xs pt-8 text-center">
          <div>
            <p>Orang Tua / Wali Calon Siswa,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">({parentData.father_name || parentData.mother_name || 'Orang Tua / Wali'})</p>
          </div>
          <div>
            <p>Malang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Panitia PPDB SMP Laboratorium UM,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">(Sekretariat Admisi P2LP UM)</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRE-FOOTER CALL TO ACTION (KONSISTEN SITUS WEB)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-[#062940] text-white py-12 sm:py-14 w-full border-t border-white/10 mt-auto print:hidden">
        {/* Foto Gedung Sekolah Faded Overlay di Kiri */}
        <div className="absolute inset-y-0 left-0 w-2/5 overflow-hidden pointer-events-none opacity-25">
          <Image
            src="/images/school-gate.jpg"
            alt=""
            fill
            unoptimized
            sizes="40vw"
            className="object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#062940]/80 to-[#062940]" aria-hidden="true" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="text-center lg:text-left border-l-0 lg:border-l-2 lg:border-white/20 lg:pl-5">
              <h2 className="font-pub-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                Masih Ada Pertanyaan?
              </h2>
              <p className="text-white/80 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                Tim panitia admisi SMP Laboratorium UM siap membantu Anda untuk proses pendaftaran maupun informasi lainnya seputar sekolah kami.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/ppdb"
                className="w-full sm:w-auto text-center bg-[#C89332] hover:bg-[#B57C23] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#062940]"
              >
                <span>PPDB Online</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/kontak"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-[#062940] hover:bg-white/10 border border-white/40 hover:border-white text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#C89332]"
              >
                <span>Hubungi Kami</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
