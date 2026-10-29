/**
 * Shown after a successful PNG/ZIP export — celebrate + optional rename.
 */

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

interface ExportSuccessModalProps {
  isOpen: boolean;
  projectName: string;
  screenshotCount: number;
  onClose: () => void;
  onRename: (name: string) => void;
}

export const ExportSuccessModal = ({
  isOpen,
  projectName,
  screenshotCount,
  onClose,
  onRename,
}: ExportSuccessModalProps) => {
  const [name, setName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(projectName);
    const t = window.setTimeout(() => inputRef.current?.select(), 50);
    return () => window.clearTimeout(t);
  }, [isOpen, projectName]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commitRename = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== projectName) {
      onRename(trimmed);
    }
  };

  const handleDone = () => {
    commitRename();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-success-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-[0_32px_120px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2
                id="export-success-title"
                className="text-lg font-semibold text-white tracking-tight"
              >
                Export ready
              </h2>
              <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                {screenshotCount} screenshot
                {screenshotCount !== 1 ? "s" : ""} downloaded. Looking sharp —
                ready for the store.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="text-xs text-zinc-500 mb-1.5 block">
              Project name
            </span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDone();
              }}
              onBlur={commitRename}
              className="w-full rounded-xl border border-white/10 bg-[#232325] px-3 py-2.5 text-sm text-white outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20"
              placeholder="My app screens"
            />
          </label>

          <button
            type="button"
            onClick={handleDone}
            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
