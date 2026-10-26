/**
 * SelectionHandles Component
 *
 * Interactive corner / side / rotation handles (Canva-style).
 */

import type React from "react";

type ResizeHandle = "e" | "w" | "se" | "sw" | "ne" | "nw";

interface SelectionHandlesProps {
  showSideHandles?: boolean;
  showCorners?: boolean;
  showRotation?: boolean;
  onResizeStart?: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onRotateStart?: (e: React.MouseEvent) => void;
}

const CORNERS: { handle: ResizeHandle; className: string; cursor: string }[] = [
  { handle: "nw", className: "-top-1.5 -left-1.5", cursor: "nwse-resize" },
  { handle: "ne", className: "-top-1.5 -right-1.5", cursor: "nesw-resize" },
  { handle: "sw", className: "-bottom-1.5 -left-1.5", cursor: "nesw-resize" },
  { handle: "se", className: "-bottom-1.5 -right-1.5", cursor: "nwse-resize" },
];

const SIDES: { handle: ResizeHandle; className: string; cursor: string }[] = [
  {
    handle: "w",
    className: "top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-4 rounded-sm",
    cursor: "ew-resize",
  },
  {
    handle: "e",
    className: "top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-4 rounded-sm",
    cursor: "ew-resize",
  },
];

export const SelectionHandles = ({
  showSideHandles = false,
  showCorners = true,
  showRotation = false,
  onResizeStart,
  onRotateStart,
}: SelectionHandlesProps) => (
  <>
    {showCorners &&
      CORNERS.map((pos) => (
        <div
          key={pos.handle}
          role="presentation"
          className={`absolute ${pos.className} w-3 h-3 bg-white border-2 border-violet-500 rounded-full shadow-sm z-20 ${
            onResizeStart ? "pointer-events-auto" : "pointer-events-none"
          }`}
          style={{ cursor: onResizeStart ? pos.cursor : undefined }}
          onMouseDown={(e) => onResizeStart?.(e, pos.handle)}
        />
      ))}

    {showSideHandles &&
      SIDES.map((pos) => (
        <div
          key={pos.handle}
          role="presentation"
          className={`absolute ${pos.className} bg-white border-2 border-violet-500 shadow-sm z-20 ${
            onResizeStart ? "pointer-events-auto" : "pointer-events-none"
          }`}
          style={{ cursor: onResizeStart ? pos.cursor : undefined }}
          onMouseDown={(e) => onResizeStart?.(e, pos.handle)}
        />
      ))}

    {showRotation && (
      <button
        type="button"
        title="Rotate"
        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-violet-500 text-violet-600 flex items-center justify-center shadow-sm z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => onRotateStart?.(e)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 3v6h-6" />
        </svg>
      </button>
    )}
  </>
);
