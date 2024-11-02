"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Dialog({ isOpen, onClose, children, title }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      <div
        ref={dialogRef}
        className="relative z-50 w-full max-w-lg rounded-lg border border-cyan-800/30 bg-slate-900/95 p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-cyan-100">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-cyan-100">{children}</div>
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      {children}
    </div>
  );
}
