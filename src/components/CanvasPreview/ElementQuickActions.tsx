/**
 * Compact actions near the selected element (Canva-style chip).
 * Heavy formatting lives in TextFormatBar outside the screenshot.
 */

import { Copy, Trash2 } from "lucide-react";

interface ElementQuickActionsProps {
  xPercent: number;
  yPercent: number;
  /** Hide duplicate for fixed text slots (title/description). */
  showDuplicate?: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
}

const btn =
  "p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors";

export const ElementQuickActions = ({
  xPercent,
  yPercent,
  showDuplicate = true,
  onDuplicate,
  onDelete,
}: ElementQuickActionsProps) => {
  // Keep chip below the element when near the top so it doesn't cover the title.
  const placeBelow = yPercent < 14;

  return (
    <div
      data-floating-toolbar="true"
      className="absolute z-[400] flex items-center gap-0.5 rounded-xl bg-white px-1 py-1 shadow-lg border border-black/10 pointer-events-auto"
      style={{
        left: `${xPercent}%`,
        top: placeBelow
          ? `calc(${yPercent}% + 32px)`
          : `calc(${yPercent}% - 44px)`,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {showDuplicate && (
        <button
          type="button"
          title="Duplicate"
          className={btn}
          onClick={onDuplicate}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        title="Delete"
        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
        onClick={onDelete}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
