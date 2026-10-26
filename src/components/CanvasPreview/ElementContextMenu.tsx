/**
 * ElementContextMenu — Canva-style right-click menu for layers & actions.
 */

import { useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Trash2,
} from "lucide-react";

export type ContextMenuAction =
  | "bring-forward"
  | "send-backward"
  | "bring-to-front"
  | "send-to-back"
  | "duplicate"
  | "delete";

interface ElementContextMenuProps {
  x: number;
  y: number;
  showLayerActions: boolean;
  onAction: (action: ContextMenuAction) => void;
  onClose: () => void;
}

const ITEM =
  "w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-800 hover:bg-violet-50 rounded-md";

export const ElementContextMenu = ({
  x,
  y,
  showLayerActions,
  onAction,
  onClose,
}: ElementContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Keep menu inside viewport
  const left = Math.min(x, window.innerWidth - 220);
  const top = Math.min(y, window.innerHeight - 280);

  return (
    <div
      ref={ref}
      className="fixed z-[9999] min-w-[200px] rounded-xl bg-white p-1.5 shadow-xl border border-black/10"
      style={{ left, top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {showLayerActions && (
        <>
          <button
            type="button"
            className={ITEM}
            onClick={() => onAction("bring-forward")}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Bring forward
          </button>
          <button
            type="button"
            className={ITEM}
            onClick={() => onAction("send-backward")}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Send backward
          </button>
          <button
            type="button"
            className={ITEM}
            onClick={() => onAction("bring-to-front")}
          >
            <ChevronsUp className="w-3.5 h-3.5" />
            Bring to front
          </button>
          <button
            type="button"
            className={ITEM}
            onClick={() => onAction("send-to-back")}
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            Send to back
          </button>
          <div className="my-1 h-px bg-neutral-200" />
        </>
      )}
      <button
        type="button"
        className={ITEM}
        onClick={() => onAction("duplicate")}
      >
        <Copy className="w-3.5 h-3.5" />
        Duplicate
      </button>
      <button
        type="button"
        className={`${ITEM} text-red-600 hover:bg-red-50`}
        onClick={() => onAction("delete")}
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
};
