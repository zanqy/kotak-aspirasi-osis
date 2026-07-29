"use client";

import { createContext, useContext, ReactNode } from "react";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface MotionContextValue {
  /** Apakah ini first visit ke aplikasi */
  isFirstVisit: boolean;
  /** Apakah user mengaktifkan prefers-reduced-motion */
  reducedMotion: boolean;
  /** Mode animasi: 'full' untuk first visit, 'quick' untuk navigasi */
  mode: "full" | "quick";
}

const MotionContext = createContext<MotionContextValue>({
  isFirstVisit: true,
  reducedMotion: false,
  mode: "full",
});

export function useMotionContext() {
  return useContext(MotionContext);
}

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Provider global untuk state animasi.
 * Menyediakan info: first visit, reduced motion, dan mode animasi.
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  const isFirstVisit = useFirstVisit("hasVisited");
  const reducedMotion = usePrefersReducedMotion();
  const mode = isFirstVisit && !reducedMotion ? "full" : "quick";

  return (
    <MotionContext.Provider value={{ isFirstVisit, reducedMotion, mode }}>
      {children}
    </MotionContext.Provider>
  );
}
