/**
 * Compact screen filmstrip under the toolbar — jump to any screenshot.
 */

import { useEffect, useRef } from "react";
import type { Screenshot } from "../../types";
import { getBackgroundCss } from "../../lib/gradient-style";

interface FilmstripProps {
  screenshots: Screenshot[];
  activeScreenshotId: string;
  exportAspect: number;
  onSelect: (id: string) => void;
}

export const Filmstrip = ({
  screenshots,
  activeScreenshotId,
  exportAspect,
  onSelect,
}: FilmstripProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = rowRef.current?.querySelector<HTMLElement>(
      `[data-filmstrip-id="${activeScreenshotId}"]`,
    );
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeScreenshotId]);

  if (screenshots.length <= 1) return null;

  const thumbHeight = 44;
  const thumbWidth = Math.max(24, Math.round(thumbHeight * exportAspect));

  return (
    <div className="shrink-0 border-b border-[var(--ed-border)] bg-[var(--ed-panel)] px-3 py-2">
      <div
        ref={rowRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-thin"
      >
        {screenshots.map((shot, index) => {
          const active = shot.id === activeScreenshotId;
          const deviceSrc =
            shot.devices.find((d) => d.id === shot.activeDeviceId)
              ?.screenshotSrc ??
            shot.devices.find((d) => d.screenshotSrc)?.screenshotSrc ??
            null;

          return (
            <button
              key={shot.id}
              type="button"
              data-filmstrip-id={shot.id}
              title={`Screen ${index + 1}`}
              onClick={() => onSelect(shot.id)}
              className={`relative shrink-0 overflow-hidden rounded-md border transition-colors ${
                active
                  ? "border-white ring-1 ring-white/40"
                  : "border-white/15 hover:border-white/40"
              }`}
              style={{
                width: thumbWidth,
                height: thumbHeight,
                background: getBackgroundCss(shot),
              }}
            >
              {deviceSrc && (
                <img
                  src={deviceSrc}
                  alt=""
                  className="absolute inset-[18%] mx-auto h-[64%] w-auto max-w-[55%] object-cover rounded-[2px] opacity-90"
                />
              )}
              <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[9px] text-white/90">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
