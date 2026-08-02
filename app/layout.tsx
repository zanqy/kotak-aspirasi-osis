import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

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
    <html lang="id">
      <body className="antialiased font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
