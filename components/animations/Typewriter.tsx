"use client";

import { useTypewriter } from "@/hooks/useTypewriter";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  cursorClassName?: string;
}

/**
 * Komponen Typewriter: menampilkan teks huruf per huruf dengan cursor berkedip.
 * Jika prefers-reduced-motion, langsung tampilkan teks penuh tanpa animasi.
 */
export default function Typewriter({
  text,
  speed = 45,
  onComplete,
  className = "",
  cursorClassName = "",
}: TypewriterProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { displayText, cursor, isDone } = useTypewriter(
    text,
    reducedMotion ? 1 : speed,
    onComplete
  );

  // Jika reduced motion, langsung render teks penuh
  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {displayText}
      {cursor && !isDone && (
        <span
          className={`inline-block w-[2px] h-[1em] bg-[#7bbde8] ml-0.5 align-middle animate-pulse ${cursorClassName}`}
        />
      )}
    </span>
  );
}
