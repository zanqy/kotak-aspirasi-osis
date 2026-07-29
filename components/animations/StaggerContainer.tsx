"use client";

import { motion, Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

/**
 * Container yang menganimasi children-nya satu per satu (stagger).
 * Setiap child harus memiliki prop variants dengan key "hidden" dan "visible".
 */
export default function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className = "",
}: StaggerContainerProps) {
  const reducedMotion = usePrefersReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : staggerDelay,
        delayChildren: reducedMotion ? 0 : delayChildren,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Variant item standar untuk digunakan di dalam StaggerContainer.
 * Setiap child harus: <motion.div variants={staggerItemVariants}>...</motion.div>
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/**
 * Variant item untuk chat bubble yang masuk dari kiri.
 */
export const staggerLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/**
 * Variant item untuk chat bubble yang masuk dari kanan.
 */
export const staggerRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};
