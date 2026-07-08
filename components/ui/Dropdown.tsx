"use client";

import { useState, useRef, useEffect } from "react";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#f4f9fc] border border-[#c8dde8] rounded-[14px] px-4 py-3.5 text-[14px] text-left flex items-center justify-between outline-none"
      >
        <span className={value ? "text-[#1a3d47]" : "text-[#6ea2b3]"}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[#6ea2b3] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-[#c8dde8] rounded-[14px] overflow-hidden"
          style={{ boxShadow: "0 4px 20px rgba(73,118,159,0.12)" }}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-[14px] text-left flex items-center justify-between border-b border-[#f0f7fa] last:border-b-0 hover:bg-[#f4f9fc] transition-colors ${
                value === option
                  ? "text-[#49769f] font-medium"
                  : "text-[#1a3d47]"
              }`}
            >
              <span>{option}</span>
              {value === option && (
                <span className="text-[#7bbde8] text-[16px]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}