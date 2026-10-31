/**
 * Magnetic snap for artboard drag (positions in % of the card).
 * Elements are center-anchored (translate -50%, -50%).
 */

export type SnapGuide = {
  /** Vertical line → constant X%; horizontal → constant Y% */
  axis: "x" | "y";
  position: number;
};

export type SnapBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CANVAS_TARGETS = [0, 50, 100] as const;

function edges(box: SnapBox) {
  const halfW = box.width / 2;
  const halfH = box.height / 2;
  return {
    left: box.x - halfW,
    cx: box.x,
    right: box.x + halfW,
    top: box.y - halfH,
    cy: box.y,
    bottom: box.y + halfH,
  };
}

function pickSnap(
  value: number,
  candidates: number[],
  threshold: number,
): { value: number; guide: number | null } {
  let best: number | null = null;
  let bestDist = threshold;
  for (const c of candidates) {
    const d = Math.abs(value - c);
    if (d <= bestDist) {
      bestDist = d;
      best = c;
    }
  }
  if (best === null) return { value, guide: null };
  return { value: best, guide: best };
}

/**
 * Snap element center so its center/edges align with canvas + peer centers/edges.
 * @param thresholdPercent — snap distance in % of the artboard (≈6–8 feels Canva-like)
 */
export function snapDragPosition(
  x: number,
  y: number,
  self: SnapBox,
  peers: SnapBox[],
  thresholdPercent = 1.25,
  enabled = true,
): { x: number; y: number; guides: SnapGuide[] } {
  if (!enabled) return { x, y, guides: [] };

  const moving: SnapBox = { ...self, x, y };
  const me = edges(moving);

  const xCandidates: number[] = [...CANVAS_TARGETS];
  const yCandidates: number[] = [...CANVAS_TARGETS];
  for (const peer of peers) {
    const p = edges(peer);
    xCandidates.push(p.left, p.cx, p.right);
    yCandidates.push(p.top, p.cy, p.bottom);
  }

  // Prefer snapping the center; also try aligning left/right to candidates
  const cxSnap = pickSnap(me.cx, xCandidates, thresholdPercent);
  const leftSnap = pickSnap(me.left, xCandidates, thresholdPercent);
  const rightSnap = pickSnap(me.right, xCandidates, thresholdPercent);

  let nextX = x;
  let guideX: number | null = null;
  const xOptions = [
    { dist: Math.abs(me.cx - (cxSnap.guide ?? me.cx)), apply: () => {
      if (cxSnap.guide !== null) {
        nextX = cxSnap.value;
        guideX = cxSnap.guide;
      }
    }},
    { dist: Math.abs(me.left - (leftSnap.guide ?? me.left)), apply: () => {
      if (leftSnap.guide !== null) {
        nextX = leftSnap.value + self.width / 2;
        guideX = leftSnap.guide;
      }
    }},
    { dist: Math.abs(me.right - (rightSnap.guide ?? me.right)), apply: () => {
      if (rightSnap.guide !== null) {
        nextX = rightSnap.value - self.width / 2;
        guideX = rightSnap.guide;
      }
    }},
  ].filter((o) => o.dist <= thresholdPercent);
  xOptions.sort((a, b) => a.dist - b.dist);
  xOptions[0]?.apply();

  const cySnap = pickSnap(me.cy, yCandidates, thresholdPercent);
  const topSnap = pickSnap(me.top, yCandidates, thresholdPercent);
  const bottomSnap = pickSnap(me.bottom, yCandidates, thresholdPercent);

  let nextY = y;
  let guideY: number | null = null;
  const yOptions = [
    { dist: Math.abs(me.cy - (cySnap.guide ?? me.cy)), apply: () => {
      if (cySnap.guide !== null) {
        nextY = cySnap.value;
        guideY = cySnap.guide;
      }
    }},
    { dist: Math.abs(me.top - (topSnap.guide ?? me.top)), apply: () => {
      if (topSnap.guide !== null) {
        nextY = topSnap.value + self.height / 2;
        guideY = topSnap.guide;
      }
    }},
    { dist: Math.abs(me.bottom - (bottomSnap.guide ?? me.bottom)), apply: () => {
      if (bottomSnap.guide !== null) {
        nextY = bottomSnap.value - self.height / 2;
        guideY = bottomSnap.guide;
      }
    }},
  ].filter((o) => o.dist <= thresholdPercent);
  yOptions.sort((a, b) => a.dist - b.dist);
  yOptions[0]?.apply();

  const guides: SnapGuide[] = [];
  if (guideX !== null) guides.push({ axis: "x", position: guideX });
  if (guideY !== null) guides.push({ axis: "y", position: guideY });

  return { x: nextX, y: nextY, guides };
}

export const SNAP_PREF_KEY = "appshots-snap-enabled";

export function readSnapEnabled(): boolean {
  try {
    const v = localStorage.getItem(SNAP_PREF_KEY);
    if (v === "0" || v === "false") return false;
  } catch {
    /* ignore */
  }
  return true;
}

export function writeSnapEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SNAP_PREF_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}
