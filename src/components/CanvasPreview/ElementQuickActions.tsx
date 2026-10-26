/**
 * Compact actions near the selected element (Canva-style chip).
 * Heavy formatting lives in TextFormatBar outside the screenshot.
 */

import type { CSSProperties } from "react";
import { Copy, Trash2 } from "lucide-react";

interface ElementQuickActionsProps {
  xPercent: number;
  yPercent: number;
  /** Half-width of the element in % — used when docking beside it */
  halfWidthPercent?: number;
  /**
   * Keep top-center free (rotation handle). Docks the chip to the
   * top-right outside the element instead of above the center.
   */
  clearTopCenter?: boolean;
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
  halfWidthPercent = 20,
  clearTopCenter = false,
  showDuplicate = true,
  onDuplicate,
  onDelete,
}: ElementQuickActionsProps) => {
  // Text / default: above, or below when near the top edge.
  const placeBelow = !clearTopCenter && yPercent < 14;

  const style: CSSProperties = clearTopCenter
    ? {
        // Outside the top-right corner — leaves rotation handle free at top-center
        left: `calc(${xPercent}% + ${halfWidthPercent}% + 10px)`,
        top: `${yPercent}%`,
        transform: "translateY(-4px)",
      }
    : {
        left: `${xPercent}%`,
        top: placeBelow
          ? `calc(${yPercent}% + 32px)`
          : `calc(${yPercent}% - 44px)`,
        transform: "translateX(-50%)",
      };

  return (
    <div
      data-floating-toolbar="true"
      className="absolute z-[400] flex items-center gap-0.5 rounded-xl bg-white px-1 py-1 shadow-lg border border-black/10 pointer-events-auto"
      style={style}
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
