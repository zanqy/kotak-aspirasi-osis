"use client";

import MotionProvider from "@/components/animations/MotionProvider";
import PageTransition from "@/components/animations/PageTransition";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <MotionProvider>
      <PageTransition>{children}</PageTransition>
    </MotionProvider>
  );
}
