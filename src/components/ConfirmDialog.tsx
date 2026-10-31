/**
 * In-app confirm dialog (replaces window.confirm for editor flows).
 */

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl border border-[var(--ed-border)] bg-[var(--ed-surface)] text-[var(--ed-fg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3">
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold tracking-tight"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-[var(--ed-fg-muted)] leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5 pt-2">
          <button
            type="button"
            className="rounded-lg px-3.5 py-2 text-sm text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] transition-colors"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-lg bg-[var(--ed-inverse)] px-3.5 py-2 text-sm font-medium text-[var(--ed-inverse-fg)] hover:opacity-90 transition-opacity"
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
