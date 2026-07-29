"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterReturn {
  displayText: string;
  cursor: boolean;
  isDone: boolean;
}

/**
 * Efek typewriter: menampilkan teks huruf per huruf.
 * Cursor berkedip selama mengetik, lalu hilang setelah selesai.
 */
export function useTypewriter(
  text: string,
  speed: number = 45,
  onComplete?: () => void
): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState("");
  const [cursor, setCursor] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset jika teks berubah
    indexRef.current = 0;
    setDisplayText("");
    setIsDone(false);

    // Cursor blinking
    cursorIntervalRef.current = setInterval(() => {
      setCursor((prev) => !prev);
    }, 530);

    const typeInterval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(typeInterval);
        setIsDone(true);
        // Hentikan cursor blinking setelah jeda
        setTimeout(() => {
          if (cursorIntervalRef.current) {
            clearInterval(cursorIntervalRef.current);
          }
          setCursor(false);
          onComplete?.();
        }, 500);
      }
    }, speed);

    return () => {
      clearInterval(typeInterval);
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, [text, speed]);

  return { displayText, cursor, isDone };
}
