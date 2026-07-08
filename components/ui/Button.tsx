"use client";

interface ButtonProps {
  variant: "primary" | "secondary" | "danger" | "success";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonProps["variant"], string> = {
  primary:
    "bg-[#7bbde8] text-white rounded-[14px] py-3.5 w-full font-medium text-[14px]",
  secondary:
    "bg-white text-[#4e8ea2] border border-[#c8dde8] rounded-[14px] py-3 w-full font-medium text-[14px]",
  danger:
    "bg-[#fff0f0] text-[#c0392b] border border-[#f5b8b8] rounded-[8px] px-3 py-1.5 text-[12px] font-medium",
  success:
    "bg-[#f0fbf6] text-[#1a7a4a] border border-[#a8e8c4] rounded-[8px] px-3 py-1.5 text-[12px] font-medium",
};

export default function Button({
  variant,
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantStyles[variant]} transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}