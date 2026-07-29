"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function Dropdown({ options, value, onChange, placeholder = "Pilih..." }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border-[1.5px] border-[#DCE8FF] rounded-lg px-3 py-[9px] text-[13px] text-navy bg-white outline-none transition-all duration-400 focus:border-blue focus:shadow-[0_0_0_4px_rgba(29,111,255,0.06)] hover:border-blue-light flex items-center justify-between gap-2"
      >
        <span className={value ? "text-navy" : "text-gray-400"}>{value || placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <IconChevronDown size={14} className="text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DCE8FF] rounded-lg shadow-[0_4px_20px_rgba(29,111,255,0.12)] z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors hover:bg-blue-pale ${opt === value ? "text-blue font-medium" : "text-navy"}`}
              >
                {opt}
                {opt === value && <IconCheck size={14} className="text-blue" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
