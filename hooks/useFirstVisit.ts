"use client";

import { useState, useEffect } from "react";

/**
 * Cek apakah ini first visit ke halaman/aplikasi.
 * Menggunakan sessionStorage — jadi hanya first visit per tab,
 * hard refresh tetap full experience.
 */
export function useFirstVisit(key: string = "hasVisited"): boolean {
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visited = sessionStorage.getItem(key);
    if (visited === "true") {
      setIsFirst(false);
    } else {
      sessionStorage.setItem(key, "true");
      setIsFirst(true);
    }
  }, [key]);

  return isFirst;
}
