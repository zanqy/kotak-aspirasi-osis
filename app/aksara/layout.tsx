import type { Metadata } from "next";
import { Fraunces, Spectral, IBM_Plex_Mono, Caveat } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-spectral",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "AKSARA. — Mading Digital Sekolah",
  description:
    "Mading digital, profil siswa, dan surat-menyurat antar siswa. Ditempel tangan, dibaca semua orang.",
};

export default function AksaraLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${fraunces.variable} ${spectral.variable} ${ibmPlexMono.variable} ${caveat.variable} min-h-screen bg-[#F2ECDE] text-[#221D15] font-[var(--font-spectral)]`}
    >
      {children}
    </div>
  );
}
