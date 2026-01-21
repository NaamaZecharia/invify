import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import Toast from "../components/Toast";

type ToastVariant = "success" | "error" | "info";

type ToastState = {
  open: boolean;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant, ms?: number) => void;
  closeToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    variant: "info",
  });

  const timerRef = useRef<number | null>(null);

  const closeToast = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast((t) => ({ ...t, open: false }));
  };

  const showToast = (message: string, variant: ToastVariant = "info", ms = 2500) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);

    setToast({ open: true, message, variant });

    timerRef.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
      timerRef.current = null;
    }, ms);
  };

  const value = useMemo(() => ({ showToast, closeToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast viewport */}
      {toast.open && (
        <div className="fixed right-4 top-4 z-50 pointer-events-none">
          <Toast
            message={toast.message}
            variant={toast.variant}
            onClose={closeToast}
          />
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
