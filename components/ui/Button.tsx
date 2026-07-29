"use client";

import { motion } from "framer-motion";

interface ButtonProps {
  variant?: "primary" | "secondary" | "success" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  icon?: React.ReactNode;
}

const variants = {
  primary: "bg-gradient-to-br from-blue to-blue-dark text-white border-none hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(29,111,255,0.3)]",
  secondary: "bg-white text-blue border-[1.5px] border-[#DCE8FF] hover:bg-blue-pale hover:-translate-y-0.5 hover:border-blue hover:shadow-[0_8px_28px_rgba(29,111,255,0.1)]",
  success: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(34,197,94,0.3)]",
  danger: "bg-gradient-to-br from-red-500 to-red-600 text-white border-none hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(239,68,68,0.3)]",
};

export default function Button({ variant = "primary", children, onClick, disabled, type = "button", className = "", icon }: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 py-[11px] px-5 rounded-[9px] text-[13px] font-display font-semibold transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
    >
      {icon}
      {children}
    </motion.button>
  );
}
