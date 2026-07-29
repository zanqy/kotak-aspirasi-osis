import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OSIS — Humas | Suara Anda Penting",
  description:
    "Sampaikan aspirasi, kritik, atau masukanmu untuk OSIS secara anonim. Aman, mudah, dan langsung sampai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
