import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/query-provider";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SISTLABUM — Portal Sekolah Satu Pintu",
  description: "Dashboard Administrasi Terpadu Labschool: Akademik, CBT, PPDB, Penilaian & Manajemen Sekolah",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakartaSans.variable} font-sans h-full`}>
      <body className="min-h-full bg-[#fbfbfd] text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
