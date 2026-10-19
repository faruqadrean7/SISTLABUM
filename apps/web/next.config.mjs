/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/admin/grades',
        destination: '/admin/academic/grades',
        permanent: false,
      },
      {
        source: '/admin/grades/input',
        destination: '/admin/academic/grades',
        permanent: false,
      },
      {
        source: '/admin/grades/progress-report',
        destination: '/admin/academic/progress-reports',
        permanent: false,
      },
      {
        source: '/admin/grades/report-cards',
        destination: '/admin/academic/report-cards',
        permanent: false,
      },
      // === URL ALIASES SESUAI SPESIFIKASI PORTAL SEKOLAH ===
      {
        source: '/guru',
        destination: '/portal/guru',
        permanent: false,
      },
      {
        source: '/guru/:path*',
        destination: '/portal/guru/:path*',
        permanent: false,
      },
      {
        source: '/siswa',
        destination: '/portal/siswa',
        permanent: false,
      },
      {
        source: '/siswa/:path*',
        destination: '/portal/siswa/:path*',
        permanent: false,
      },
      {
        source: '/ortu',
        destination: '/portal/ortu',
        permanent: false,
      },
      {
        source: '/ortu/:path*',
        destination: '/portal/ortu/:path*',
        permanent: false,
      },
      {
        source: '/staf',
        destination: '/portal/staf',
        permanent: false,
      },
      {
        source: '/staf/:path*',
        destination: '/portal/staf/:path*',
        permanent: false,
      },
      {
        source: '/kepsek',
        destination: '/portal/kepsek',
        permanent: false,
      },
      {
        source: '/kepsek/:path*',
        destination: '/portal/kepsek/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
