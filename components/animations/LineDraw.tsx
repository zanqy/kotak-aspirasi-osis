"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface LineDrawProps {
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Garis dekoratif yang "ditarik" dari kiri ke kanan.
 * Digunakan di landing page first-visit entrance.
 */
export default function LineDraw({
  delay = 0.5,
  duration = 1.3,
  className = "",
}: LineDrawProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={`h-[2px] bg-[#c8dde8] w-full ${className}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        duration: reducedMotion ? 0 : duration,
        ease: "easeOut",
        delay: reducedMotion ? 0 : delay,
      }}
      style={{ transformOrigin: "left" }}
    />
  );
}
