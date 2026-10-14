import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/portal/siswa/:path*",
        destination: "/siswa/:path*",
      },
      {
        source: "/portal/guru/:path*",
        destination: "/guru/:path*",
      },
      {
        source: "/portal/ortu/:path*",
        destination: "/ortu/:path*",
      },
    ];
  },
};

export default nextConfig;
