"use client";

import { useFormStatus } from "react-dom";
import { Loader2, type LucideIcon } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
  icon?: LucideIcon;
}

export function SubmitButton({
  children,
  loadingText = "Processing...",
  icon: Icon,
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} className="shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
