"use client";

import { motion, Variants } from "framer-motion";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface EntranceWrapperProps {
  children: React.ReactNode;
  /** Key unik untuk sessionStorage (default: 'hasVisited') */
  storageKey?: string;
  /** Total durasi entrance (default: 2.8s untuk landing, 1.5s untuk dashboard) */
  className?: string;
}

/**
 * Wrapper untuk first-visit entrance animation.
 * Hanya menganimasi jika ini first visit (sessionStorage 'key' === null).
 * Jika bukan first visit atau prefers-reduced-motion, langsung render tanpa animasi.
 */
export default function EntranceWrapper({
  children,
  storageKey = "hasVisited",
  className = "",
}: EntranceWrapperProps) {
  const isFirstVisit = useFirstVisit(storageKey);
  const reducedMotion = usePrefersReducedMotion();

  const shouldAnimate = isFirstVisit && !reducedMotion;

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Variant untuk item yang muncul dengan scale + spring.
 */
export const springScaleVariants: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};
