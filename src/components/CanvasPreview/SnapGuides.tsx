/**
 * Magenta-ish snap lines while dragging (Canva-style, low noise).
 */

import type { SnapGuide } from "../../lib/snap";

interface SnapGuidesProps {
  guides: SnapGuide[];
}

export const SnapGuides = ({ guides }: SnapGuidesProps) => {
  if (guides.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[80]" aria-hidden>
      {guides.map((g, i) =>
        g.axis === "x" ? (
          <div
            key={`x-${g.position}-${i}`}
            className="absolute top-0 bottom-0 w-px bg-sky-400/90 shadow-[0_0_0_1px_rgba(14,165,233,0.25)]"
            style={{ left: `${g.position}%` }}
          />
        ) : (
          <div
            key={`y-${g.position}-${i}`}
            className="absolute left-0 right-0 h-px bg-sky-400/90 shadow-[0_0_0_1px_rgba(14,165,233,0.25)]"
            style={{ top: `${g.position}%` }}
          />
        ),
      )}
    </div>
  );
};
