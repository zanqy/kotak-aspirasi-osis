"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Animasi count-up dari 0 ke target.
 * Menggunakan requestAnimationFrame untuk performa optimal.
 */
export function useCountUp(
  target: number,
  duration: number = 800,
  shouldAnimate: boolean = true
): number {
  const [count, setCount] = useState(shouldAnimate ? 0 : target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(target);
      return;
    }

    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, shouldAnimate]);

  return count;
}
