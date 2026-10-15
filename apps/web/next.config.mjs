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
    ];
  },
};

export default nextConfig;
