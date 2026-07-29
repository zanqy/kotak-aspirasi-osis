"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        custom={1}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
