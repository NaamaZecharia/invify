type ToastProps = {
  message: string;
  variant?: "success" | "error" | "info";
  onClose: () => void;
};

export default function Toast({ message, variant = "info", onClose }: ToastProps) {
  const base =
    "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm";
  const variants: Record<string, string> = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    info: "bg-slate-50 border-slate-200 text-slate-900",
  };

  return (
    <div className={`${base} ${variants[variant]}`}>
      <div className="text-sm">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="ml-auto text-sm opacity-70 hover:opacity-100"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
}