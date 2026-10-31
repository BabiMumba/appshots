import type {
  Screenshot,
  DeviceSpec,
  DeviceColor,
  ExportSize,
  DeviceInstance,
} from "../types";
import { getExportFilename, getExportZipName } from "../constants";
import { drawRichText, ensureTextFontsLoaded } from "./rich-text-canvas";
import { getDeviceColorById, getDeviceSpecById } from "./device-instances";
import {
  getRenderableDevicesForScreenshot,
  getRenderableOverlaysForScreenshot,
  getRenderableShapesForScreenshot,
} from "./device-overflow";
import type { ShapeOverlay } from "../types";
import {
  gradientEndpoints,
  resolveGradientColors,
} from "./gradient-style";
import { drawCoverImage } from "./screen-image";
import { ensureLayerOrder, zIndexForLayer } from "./layer-order";
import { exportUiScale } from "./design-scale";
import JSZip from "jszip";

interface ExportOptions {
  screenshots: Screenshot[];
  exportSizes: ExportSize[];
  /** @deprecated use exportSizes — kept for single-size callers */
  exportSize?: ExportSize;
  /** Width the user designed against (active preview export size) */
  designWidth?: number;
  /** When >1, ZIP nests files under locale folders */
  locales?: string[];
  baseLocale?: string;
  resolveLocaleScreenshots?: (
    screenshots: Screenshot[],
    locale: string,
  ) => Screenshot[];
}

/**
 * Convert data URL to Blob
 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Download a single file
 */
const downloadFile = (dataURL: string, filename: string) => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURL;
  link.click();
};

/**
 * Download multiple files as ZIP
 */
const downloadAsZip = async (
  files: { name: string; data: string }[],
  zipName: string,
) => {
  const zip = new JSZip();

  for (const file of files) {
    const blob = dataURLtoBlob(file.data);
    zip.file(file.name, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const link = document.createElement("a");
  link.download = zipName;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
};

// --- 3D Export Helpers ---

const EXPORT_EDGE_DEPTH = 16; // Must match DeviceFrame3D EDGE_DEPTH

interface Point2D {
  x: number;
  y: number;
}

const lerp3d = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Project a 3D point to 2D with perspective.
 * Matches CSS: perspective + transform: rotateY(ry) rotateX(rx)
 */
const project3DPoint = (
  x: number,
  y: number,
  z: number,
  ryRad: number,
  rxRad: number,
  perspective: number,
  cx: number,
  cy: number,
): Point2D => {
  const cosY = Math.cos(ryRad);
  const sinY = Math.sin(ryRad);
  const cosX = Math.cos(rxRad);
  const sinX = Math.sin(rxRad);

  // CSS: transform: rotateY(ry) rotateX(rx) → matrix RY * RX
  // Apply rotateX first (affects y, z), then rotateY (affects x, z)
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  const px = x * cosY + z1 * sinY;
  const py = y1;
  const pz = -x * sinY + z1 * cosY;

  // CSS perspective: scale = d / (d - z)
  const scale = perspective / (perspective - pz);
  return { x: cx + px * scale, y: cy + py * scale };
};

/**
 * Get projected corners [TL, TR, BR, BL] for a rectangle at given Z.
 */
const getProjectedCorners = (
  halfW: number,
  halfH: number,
  z: number,
  ryRad: number,
  rxRad: number,
  perspective: number,
  cx: number,
  cy: number,
): Point2D[] => [
  project3DPoint(-halfW, -halfH, z, ryRad, rxRad, perspective, cx, cy),
  project3DPoint(halfW, -halfH, z, ryRad, rxRad, perspective, cx, cy),
  project3DPoint(halfW, halfH, z, ryRad, rxRad, perspective, cx, cy),
  project3DPoint(-halfW, halfH, z, ryRad, rxRad, perspective, cx, cy),
];

/**
 * Trace a projected rounded-rect path on the canvas.
 * Projects points along the rounded rect boundary from 3D local coords to 2D.
 */
const traceProjectedRoundedRect = (
  ctx: CanvasRenderingContext2D,
  halfW: number,
  halfH: number,
  radius: number,
  z: number,
  ryRad: number,
  rxRad: number,
  perspective: number,
  cx: number,
  cy: number,
) => {
  const r = Math.min(radius, halfW, halfH);
  const segs = 20; // points per corner arc

  ctx.beginPath();
  // Start after top-left corner
  let p = project3DPoint(-halfW + r, -halfH, z, ryRad, rxRad, perspective, cx, cy);
  ctx.moveTo(p.x, p.y);

  // Top edge → top-right corner
  p = project3DPoint(halfW - r, -halfH, z, ryRad, rxRad, perspective, cx, cy);
  ctx.lineTo(p.x, p.y);
  for (let i = 1; i <= segs; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * (i / segs);
    p = project3DPoint(halfW - r + r * Math.cos(a), -halfH + r + r * Math.sin(a), z, ryRad, rxRad, perspective, cx, cy);
    ctx.lineTo(p.x, p.y);
  }

  // Right edge → bottom-right corner
  p = project3DPoint(halfW, halfH - r, z, ryRad, rxRad, perspective, cx, cy);
  ctx.lineTo(p.x, p.y);
  for (let i = 1; i <= segs; i++) {
    const a = (Math.PI / 2) * (i / segs);
    p = project3DPoint(halfW - r + r * Math.cos(a), halfH - r + r * Math.sin(a), z, ryRad, rxRad, perspective, cx, cy);
    ctx.lineTo(p.x, p.y);
  }

  // Bottom edge → bottom-left corner
  p = project3DPoint(-halfW + r, halfH, z, ryRad, rxRad, perspective, cx, cy);
  ctx.lineTo(p.x, p.y);
  for (let i = 1; i <= segs; i++) {
    const a = Math.PI / 2 + (Math.PI / 2) * (i / segs);
    p = project3DPoint(-halfW + r + r * Math.cos(a), halfH - r + r * Math.sin(a), z, ryRad, rxRad, perspective, cx, cy);
    ctx.lineTo(p.x, p.y);
  }

  // Left edge → top-left corner
  p = project3DPoint(-halfW, -halfH + r, z, ryRad, rxRad, perspective, cx, cy);
  ctx.lineTo(p.x, p.y);
  for (let i = 1; i <= segs; i++) {
    const a = Math.PI + (Math.PI / 2) * (i / segs);
    p = project3DPoint(-halfW + r + r * Math.cos(a), -halfH + r + r * Math.sin(a), z, ryRad, rxRad, perspective, cx, cy);
    ctx.lineTo(p.x, p.y);
  }

  ctx.closePath();
};

/**
 * Draw an image onto a projected quadrilateral using a 2D grid subdivision.
 * No per-cell clipping — relies on the outer clip (projected rounded rect)
 * for boundary. Each cell uses source-rect drawImage for clean rendering.
 */
const drawPerspectiveImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  corners: Point2D[],
  gridX: number = 40,
  gridY: number = 60,
) => {
  const [tl, tr, br, bl] = corners;
  const srcW = img.width;
  const srcH = img.height;

  for (let yi = 0; yi < gridY; yi++) {
    for (let xi = 0; xi < gridX; xi++) {
      const u0 = xi / gridX;
      const u1 = (xi + 1) / gridX;
      const v0 = yi / gridY;
      const v1 = (yi + 1) / gridY;

      // Bilinear interpolation for 3 cell corners
      const p00x = (1 - v0) * ((1 - u0) * tl.x + u0 * tr.x) + v0 * ((1 - u0) * bl.x + u0 * br.x);
      const p00y = (1 - v0) * ((1 - u0) * tl.y + u0 * tr.y) + v0 * ((1 - u0) * bl.y + u0 * br.y);
      const p10x = (1 - v0) * ((1 - u1) * tl.x + u1 * tr.x) + v0 * ((1 - u1) * bl.x + u1 * br.x);
      const p10y = (1 - v0) * ((1 - u1) * tl.y + u1 * tr.y) + v0 * ((1 - u1) * bl.y + u1 * br.y);
      const p01x = (1 - v1) * ((1 - u0) * tl.x + u0 * tr.x) + v1 * ((1 - u0) * bl.x + u0 * br.x);
      const p01y = (1 - v1) * ((1 - u0) * tl.y + u0 * tr.y) + v1 * ((1 - u0) * bl.y + u0 * br.y);

      // Source rect for this cell (with 1px overlap to prevent seams)
      const sx = Math.max(0, srcW * u0 - 0.5);
      const sy = Math.max(0, srcH * v0 - 0.5);
      const sw = Math.min(srcW - sx, srcW * (u1 - u0) + 1);
      const sh = Math.min(srcH - sy, srcH * (v1 - v0) + 1);

      const a = (p10x - p00x) / (srcW * (u1 - u0));
      const b = (p01x - p00x) / (srcH * (v1 - v0));
      const c = (p10y - p00y) / (srcW * (u1 - u0));
      const d = (p01y - p00y) / (srcH * (v1 - v0));
      const e = p00x - a * srcW * u0 - b * srcH * v0;
      const f = p00y - c * srcW * u0 - d * srcH * v0;

      ctx.save();
      ctx.setTransform(a, c, b, d, e, f);
      ctx.drawImage(img, sx, sy, sw, sh, sx, sy, sw, sh);
      ctx.restore();
    }
  }
};

/**
 * Render the flat device (frame, screen, buttons, camera) to an offscreen canvas.
 */
const renderDeviceToOffscreen = async (
  deviceWidthPx: number,
  deviceHeightPx: number,
  frameRadius: number,
  bezelThickness: number,
  selectedDevice: DeviceSpec,
  selectedColor: DeviceColor,
  screenshotSrc: string | null,
  scaleX: number,
  isSamsung: boolean,
  imageZoom: number = 1,
  imageOffsetX: number = 0,
  imageOffsetY: number = 0,
): Promise<HTMLCanvasElement> => {
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.ceil(deviceWidthPx);
  offscreen.height = Math.ceil(deviceHeightPx);
  const ctx = offscreen.getContext("2d")!;

  const dX = 0;
  const dY = 0;
  const dW = deviceWidthPx;
  const dH = deviceHeightPx;

  // --- Draw frame ---
  ctx.save();
  if (selectedColor.frameColors) {
    const gradient = ctx.createLinearGradient(dX, dY, dX + dW, dY + dH);
    selectedColor.frameColors.forEach((color, index) => {
      gradient.addColorStop(
        index / (selectedColor.frameColors!.length - 1),
        color,
      );
    });
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = selectedColor.frame;
  }
  ctx.beginPath();
  ctx.roundRect(dX, dY, dW, dH, frameRadius);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1 * scaleX;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(
    dX + 1 * scaleX,
    dY + 1 * scaleX,
    dW - 2 * scaleX,
    dH - 2 * scaleX,
    frameRadius,
  );
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2 * scaleX;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(
    dX + 3 * scaleX,
    dY + 3 * scaleX,
    dW - 6 * scaleX,
    dH - 6 * scaleX,
    frameRadius,
  );
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2 * scaleX;
  ctx.stroke();
  ctx.restore();

  // --- Screen ---
  const screenX = dX + bezelThickness;
  const screenY = dY + bezelThickness;
  const screenW = dW - bezelThickness * 2;
  const screenH = dH - bezelThickness * 2;
  const screenRadius = frameRadius - bezelThickness;

  ctx.fillStyle = "#1c1c1e";
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenW, screenH, screenRadius);
  ctx.fill();

  // --- Screenshot image ---
  if (screenshotSrc) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(screenX, screenY, screenW, screenH, screenRadius);
        ctx.clip();
        drawCoverImage(
          ctx,
          img,
          img.naturalWidth,
          img.naturalHeight,
          screenX,
          screenY,
          screenW,
          screenH,
          imageZoom,
          imageOffsetX,
          imageOffsetY,
        );
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = screenshotSrc;
    });
  }

  // --- Camera elements ---
  if (selectedDevice.hasIsland) {
    const islandWidth = screenW * 0.28;
    const islandHeight = screenH * 0.032;
    const islandX = screenX + (screenW - islandWidth) / 2;
    const islandY = screenY + screenH * 0.018;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.roundRect(
      islandX,
      islandY,
      islandWidth,
      islandHeight,
      islandHeight / 2,
    );
    ctx.fill();
  } else if (selectedDevice.notchWidth > 0) {
    const notchWidth = screenW * 0.35;
    const notchHeight = screenH * 0.035;
    const notchX = screenX + (screenW - notchWidth) / 2;
    const notchY = screenY;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.roundRect(notchX, notchY, notchWidth, notchHeight, [
      0,
      0,
      20 * scaleX,
      20 * scaleX,
    ]);
    ctx.fill();
  } else if (isSamsung) {
    const isTablet = selectedDevice.id.includes("tab");
    const camSize = screenW * (isTablet ? 0.018 : 0.025);
    const camX = isTablet
      ? screenX + screenW * 0.35
      : screenX + (screenW - camSize) / 2;
    const camY = screenY + screenH * (isTablet ? 0.015 : 0.02);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(
      camX + camSize / 2,
      camY + camSize / 2,
      camSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  return offscreen;
};

const parseFrameRadius = (radius: string): [number, number] => {
  const [xPct, yPct] = radius.split("/").map((s) => parseFloat(s) / 100);
  return [xPct, yPct];
};

const drawDeviceInstance = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  device: DeviceInstance,
  scaleX: number,
  renderX: number = device.x,
) => {
  const selectedDevice = getDeviceSpecById(device.deviceId);
  const selectedColor = getDeviceColorById(selectedDevice.id, device.colorId);

  const deviceWidthPx = canvas.width * (device.scale / 100);
  const deviceHeightPx =
    deviceWidthPx * (selectedDevice.height / selectedDevice.width);
  const deviceX = canvas.width * (renderX / 100) - deviceWidthPx / 2;
  const deviceY = canvas.height * (device.y / 100);

  const [outerRadiusXPct, outerRadiusYPct] = parseFrameRadius(
    selectedDevice.frameRadius.outer,
  );
  const cornerRadiusX = deviceWidthPx * outerRadiusXPct;
  const cornerRadiusY = deviceHeightPx * outerRadiusYPct;
  const frameRadius = Math.min(cornerRadiusX, cornerRadiusY);
  const bezelThickness = deviceWidthPx * 0.012;
  const isSamsungDevice =
    selectedDevice.id.startsWith("samsung-") ||
    selectedDevice.id.startsWith("pixel-");

  if (device.style === "3d") {
    const rotYDeg = device.rotateY ?? -15;
    const rotXDeg = device.rotateX ?? 5;
    const ryRad = (rotYDeg * Math.PI) / 180;
    const rxRad = (rotXDeg * Math.PI) / 180;
    const perspective = 1200 * scaleX;
    const edgeDepth = EXPORT_EDGE_DEPTH * scaleX;

    const halfW = deviceWidthPx / 2;
    const halfH = deviceHeightPx / 2;
    const deviceCenterX = deviceX + halfW;
    const deviceCenterY = deviceY + halfH;

    const offscreen = await renderDeviceToOffscreen(
      deviceWidthPx,
      deviceHeightPx,
      frameRadius,
      bezelThickness,
      selectedDevice,
      selectedColor,
      device.screenshotSrc,
      scaleX,
      isSamsungDevice,
      device.imageZoom ?? 1,
      device.imageOffsetX ?? 0,
      device.imageOffsetY ?? 0,
    );

    const SLICE_COUNT = 40;
    const halfEdge = edgeDepth / 2;

    if (device.shadow?.enabled) {
      ctx.save();
      ctx.shadowColor = device.shadow.color;
      ctx.shadowBlur = device.shadow.blur * scaleX;
      ctx.shadowOffsetX = device.shadow.offsetX * scaleX;
      ctx.shadowOffsetY = device.shadow.offsetY * scaleX;
      ctx.fillStyle = "rgba(0,0,0,0.01)";
      traceProjectedRoundedRect(
        ctx,
        halfW,
        halfH,
        frameRadius,
        halfEdge,
        ryRad,
        rxRad,
        perspective,
        deviceCenterX,
        deviceCenterY,
      );
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < SLICE_COUNT; i++) {
      const t = i / (SLICE_COUNT - 1);
      const z = lerp3d(-halfEdge, halfEdge, t);

      if (i === SLICE_COUNT - 1) {
        ctx.save();
        traceProjectedRoundedRect(
          ctx,
          halfW,
          halfH,
          frameRadius,
          z,
          ryRad,
          rxRad,
          perspective,
          deviceCenterX,
          deviceCenterY,
        );
        ctx.clip();
        const corners = getProjectedCorners(
          halfW,
          halfH,
          z,
          ryRad,
          rxRad,
          perspective,
          deviceCenterX,
          deviceCenterY,
        );
        drawPerspectiveImage(ctx, offscreen, corners, 40, 60);
        ctx.restore();
      } else {
        ctx.save();

        if (selectedColor.frameColors) {
          const gradient = ctx.createLinearGradient(
            deviceCenterX - halfW,
            deviceCenterY - halfH,
            deviceCenterX + halfW,
            deviceCenterY + halfH,
          );
          selectedColor.frameColors.forEach((color, index) => {
            gradient.addColorStop(
              index / (selectedColor.frameColors!.length - 1),
              color,
            );
          });
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = selectedColor.frame;
        }
        traceProjectedRoundedRect(
          ctx,
          halfW,
          halfH,
          frameRadius,
          z,
          ryRad,
          rxRad,
          perspective,
          deviceCenterX,
          deviceCenterY,
        );
        ctx.fill();

        const darkness = (1 - t) * 0.28;
        ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
        traceProjectedRoundedRect(
          ctx,
          halfW,
          halfH,
          frameRadius,
          z,
          ryRad,
          rxRad,
          perspective,
          deviceCenterX,
          deviceCenterY,
        );
        ctx.fill();

        ctx.restore();
      }
    }

    const btnWidthPx = deviceWidthPx * 0.006;

    const draw3DButton = (
      side: "left" | "right",
      topPct: number,
      heightPct: number,
    ) => {
      const isRight = side === "right";
      const btnH = deviceHeightPx * heightPct;
      const btnTopY = -halfH + deviceHeightPx * topPct;
      const btnBotY = btnTopY + btnH;
      const btnZFront = halfEdge + 2;
      const btnXInner = isRight ? halfW - 1 : -halfW + 1;
      const btnXOuter = isRight ? halfW + btnWidthPx : -halfW - btnWidthPx;

      const p0 = project3DPoint(
        btnXInner,
        btnTopY,
        btnZFront,
        ryRad,
        rxRad,
        perspective,
        deviceCenterX,
        deviceCenterY,
      );
      const p1 = project3DPoint(
        btnXOuter,
        btnTopY,
        btnZFront,
        ryRad,
        rxRad,
        perspective,
        deviceCenterX,
        deviceCenterY,
      );
      const p2 = project3DPoint(
        btnXOuter,
        btnBotY,
        btnZFront,
        ryRad,
        rxRad,
        perspective,
        deviceCenterX,
        deviceCenterY,
      );
      const p3 = project3DPoint(
        btnXInner,
        btnBotY,
        btnZFront,
        ryRad,
        rxRad,
        perspective,
        deviceCenterX,
        deviceCenterY,
      );

      ctx.save();
      if (selectedColor.frameColors) {
        const gradient = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        gradient.addColorStop(0, selectedColor.frameColors[1]);
        gradient.addColorStop(1, selectedColor.frameColors[2]);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = selectedColor.frame;
      }
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    };

    if (isSamsungDevice) {
      draw3DButton("right", 0.22, 0.05);
      draw3DButton("right", 0.29, 0.06);
      draw3DButton("right", 0.36, 0.06);
    } else {
      draw3DButton("right", 0.18, 0.08);
      draw3DButton("left", 0.15, 0.04);
      draw3DButton("left", 0.21, 0.06);
      draw3DButton("left", 0.28, 0.06);
    }

    return;
  }

  ctx.save();
  const deviceCenterX = deviceX + deviceWidthPx / 2;
  const deviceCenterY = deviceY + deviceHeightPx / 2;
  ctx.translate(deviceCenterX, deviceCenterY);
  ctx.rotate((device.rotation * Math.PI) / 180);
  ctx.translate(-deviceCenterX, -deviceCenterY);

  const btnWidth = deviceWidthPx * 0.008;
  const btnRadius = 2 * scaleX;

  const drawButton = (
    x: number,
    y: number,
    w: number,
    h: number,
    isRight: boolean,
  ) => {
    ctx.save();
    if (selectedColor.frameColors) {
      const btnGradient = ctx.createLinearGradient(x, y, x + w, y);
      const c1 = selectedColor.frameColors[2];
      const c2 = selectedColor.frameColors[0];
      if (isRight) {
        btnGradient.addColorStop(0, c1);
        btnGradient.addColorStop(1, c2);
      } else {
        btnGradient.addColorStop(0, c2);
        btnGradient.addColorStop(1, c1);
      }
      ctx.fillStyle = btnGradient;
    } else {
      ctx.fillStyle = selectedColor.frame;
    }
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 4 * scaleX;
    ctx.shadowOffsetX = isRight ? 2 * scaleX : -2 * scaleX;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    if (isRight) {
      ctx.roundRect(x, y, w, h, [0, btnRadius, btnRadius, 0]);
    } else {
      ctx.roundRect(x, y, w, h, [btnRadius, 0, 0, btnRadius]);
    }
    ctx.fill();
    ctx.restore();
  };

  if (isSamsungDevice) {
    drawButton(
      deviceX + deviceWidthPx,
      deviceY + deviceHeightPx * 0.22,
      btnWidth,
      deviceHeightPx * 0.05,
      true,
    );
    drawButton(
      deviceX + deviceWidthPx,
      deviceY + deviceHeightPx * 0.29,
      btnWidth,
      deviceHeightPx * 0.06,
      true,
    );
    drawButton(
      deviceX + deviceWidthPx,
      deviceY + deviceHeightPx * 0.36,
      btnWidth,
      deviceHeightPx * 0.06,
      true,
    );
  } else {
    drawButton(
      deviceX + deviceWidthPx,
      deviceY + deviceHeightPx * 0.18,
      btnWidth,
      deviceHeightPx * 0.08,
      true,
    );
    drawButton(
      deviceX - btnWidth,
      deviceY + deviceHeightPx * 0.15,
      btnWidth,
      deviceHeightPx * 0.04,
      false,
    );
    drawButton(
      deviceX - btnWidth,
      deviceY + deviceHeightPx * 0.21,
      btnWidth,
      deviceHeightPx * 0.06,
      false,
    );
    drawButton(
      deviceX - btnWidth,
      deviceY + deviceHeightPx * 0.28,
      btnWidth,
      deviceHeightPx * 0.06,
      false,
    );
  }

  ctx.save();
  if (device.shadow?.enabled) {
    ctx.shadowColor = device.shadow.color;
    ctx.shadowBlur = device.shadow.blur * scaleX;
    ctx.shadowOffsetX = device.shadow.offsetX * scaleX;
    ctx.shadowOffsetY = device.shadow.offsetY * scaleX;
  }
  if (selectedColor.frameColors) {
    const gradient = ctx.createLinearGradient(
      deviceX,
      deviceY,
      deviceX + deviceWidthPx,
      deviceY + deviceHeightPx,
    );
    selectedColor.frameColors.forEach((color, index) => {
      gradient.addColorStop(
        index / (selectedColor.frameColors!.length - 1),
        color,
      );
    });
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = selectedColor.frame;
  }
  ctx.beginPath();
  ctx.roundRect(deviceX, deviceY, deviceWidthPx, deviceHeightPx, frameRadius);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1 * scaleX;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(
    deviceX + 1 * scaleX,
    deviceY + 1 * scaleX,
    deviceWidthPx - 2 * scaleX,
    deviceHeightPx - 2 * scaleX,
    frameRadius,
  );
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2 * scaleX;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(
    deviceX + 3 * scaleX,
    deviceY + 3 * scaleX,
    deviceWidthPx - 6 * scaleX,
    deviceHeightPx - 6 * scaleX,
    frameRadius,
  );
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2 * scaleX;
  ctx.stroke();
  ctx.restore();

  const screenX = deviceX + bezelThickness;
  const screenY = deviceY + bezelThickness;
  const screenWidthPx = deviceWidthPx - bezelThickness * 2;
  const screenHeightPx = deviceHeightPx - bezelThickness * 2;
  const screenRadius = frameRadius - bezelThickness;

  ctx.fillStyle = "#1c1c1e";
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidthPx, screenHeightPx, screenRadius);
  ctx.fill();

  const screenshotSrc = device.screenshotSrc;
  if (screenshotSrc) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(screenX, screenY, screenWidthPx, screenHeightPx, screenRadius);
        ctx.clip();
        drawCoverImage(
          ctx,
          img,
          img.naturalWidth,
          img.naturalHeight,
          screenX,
          screenY,
          screenWidthPx,
          screenHeightPx,
          device.imageZoom ?? 1,
          device.imageOffsetX ?? 0,
          device.imageOffsetY ?? 0,
        );
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = screenshotSrc;
    });
  }

  if (selectedDevice.hasIsland) {
    const islandWidth = screenWidthPx * 0.28;
    const islandHeight = screenHeightPx * 0.032;
    const islandX = screenX + (screenWidthPx - islandWidth) / 2;
    const islandY = screenY + screenHeightPx * 0.018;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.roundRect(islandX, islandY, islandWidth, islandHeight, islandHeight / 2);
    ctx.fill();
  } else if (selectedDevice.notchWidth > 0) {
    const notchWidth = screenWidthPx * 0.35;
    const notchHeight = screenHeightPx * 0.035;
    const notchX = screenX + (screenWidthPx - notchWidth) / 2;
    const notchY = screenY;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.roundRect(notchX, notchY, notchWidth, notchHeight, [
      0,
      0,
      20 * scaleX,
      20 * scaleX,
    ]);
    ctx.fill();
  } else if (isSamsungDevice) {
    const isTablet = selectedDevice.id.includes("tab");
    const camSize = screenWidthPx * (isTablet ? 0.018 : 0.025);
    const camX = isTablet
      ? screenX + screenWidthPx * 0.35
      : screenX + (screenWidthPx - camSize) / 2;
    const camY = screenY + screenHeightPx * (isTablet ? 0.015 : 0.02);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(
      camX + camSize / 2,
      camY + camSize / 2,
      camSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
};

const exportOneSize = async ({
  screenshots,
  exportSize,
  designWidth,
}: {
  screenshots: Screenshot[];
  exportSize: ExportSize;
  designWidth: number;
}): Promise<{ name: string; data: string }[]> => {
  const exportedFiles: { name: string; data: string }[] = [];
  const sizeFolder =
    exportSize.store === "play"
      ? `play-${exportSize.width}x${exportSize.height}`
      : `ios-${exportSize.width}x${exportSize.height}`;

  for (let i = 0; i < screenshots.length; i++) {
    const screenshot = screenshots[i];
    const filename = `${sizeFolder}/${getExportFilename(exportSize, i, screenshots.length)}`;

    const canvas = document.createElement("canvas");
    canvas.width = exportSize.width;
    canvas.height = exportSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    // UI strokes/shadows were tuned around ~400px preview; scale to export
    const scaleX = exportUiScale(canvas.width);
    // Match TextElement padding: 4px @ 400 → L+R subtract from content width, top offsets Y
    const pad = 4 * scaleX;
    const paddingX = pad * 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Opaque fill first (Apple rejects transparency)
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (screenshot.backgroundMode === "gradient") {
      const { from, via, to, angle } = resolveGradientColors(screenshot);
      const { x0, y0, x1, y1 } = gradientEndpoints(
        canvas.width,
        canvas.height,
        angle,
      );
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      if (via) {
        gradient.addColorStop(0, from);
        gradient.addColorStop(0.5, via);
        gradient.addColorStop(1, to);
      } else {
        gradient.addColorStop(0, from);
        gradient.addColorStop(1, to);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (
      screenshot.backgroundMode === "image" &&
      screenshot.backgroundImage
    ) {
      ctx.fillStyle = screenshot.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await new Promise<void>((resolve) => {
        const bg = new Image();
        bg.crossOrigin = "anonymous";
        bg.onload = () => {
          const imgAspect = bg.naturalWidth / bg.naturalHeight;
          const canvasAspect = canvas.width / canvas.height;
          let drawW: number;
          let drawH: number;
          if (imgAspect > canvasAspect) {
            drawH = canvas.height;
            drawW = drawH * imgAspect;
          } else {
            drawW = canvas.width;
            drawH = drawW / imgAspect;
          }
          ctx.drawImage(
            bg,
            (canvas.width - drawW) / 2,
            (canvas.height - drawH) / 2,
            drawW,
            drawH,
          );
          resolve();
        };
        bg.onerror = () => resolve();
        bg.src = screenshot.backgroundImage!;
      });
    } else {
      ctx.fillStyle = screenshot.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const drawOneOverlay = async (
      overlayImg: (typeof screenshot.overlayImages)[number],
      renderX: number = overlayImg.x,
    ) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const containerWidth = canvas.width * (overlayImg.width / 100);
          const containerHeight = canvas.height * (overlayImg.height / 100);
          const imgAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
          const containerAspect = containerWidth / Math.max(containerHeight, 1);

          // object-fit: cover — fill frame, crop overflow (Canva-style crop)
          let drawWidth: number;
          let drawHeight: number;
          if (imgAspect > containerAspect) {
            drawHeight = containerHeight;
            drawWidth = containerHeight * imgAspect;
          } else {
            drawWidth = containerWidth;
            drawHeight = containerWidth / imgAspect;
          }

          const centerX = canvas.width * (renderX / 100);
          const centerY = canvas.height * (overlayImg.y / 100);
          const rotation = overlayImg.rotation ?? 0;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.min(
            1,
            Math.max(0, (overlayImg.opacity ?? 100) / 100),
          );

          if (overlayImg.shadow?.enabled) {
            ctx.shadowColor = overlayImg.shadow.color;
            ctx.shadowBlur = overlayImg.shadow.blur * scaleX;
            ctx.shadowOffsetX = overlayImg.shadow.offsetX * scaleX;
            ctx.shadowOffsetY = overlayImg.shadow.offsetY * scaleX;
          }

          ctx.beginPath();
          ctx.rect(
            -containerWidth / 2,
            -containerHeight / 2,
            containerWidth,
            containerHeight,
          );
          ctx.clip();
          ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = overlayImg.src;
      });
    };

    const fontScale = canvas.width / Math.max(designWidth, 1);
    const lineHeight = 1.1;

    const textsForFonts = (screenshot.texts ?? []).map((t) => ({
      fontFamily: t.fontFamily,
      fontSize: t.fontSize * fontScale,
      fontWeight: t.fontWeight ?? 700,
    }));
    await ensureTextFontsLoaded(textsForFonts);

    const toUpperHtml = (html: string) =>
      html.replace(
        /(>|^)([^<]+)/g,
        (_m, prefix: string, text: string) => prefix + text.toLocaleUpperCase(),
      );

    const drawTextOverlay = (text: (typeof screenshot.texts)[number]) => {
      const html = text.uppercase ? toUpperHtml(text.content) : text.content;
      const boxW = canvas.width * (text.width / 100);
      drawRichText(ctx, html, {
        x: canvas.width * (text.x / 100),
        // TextElement pads on all sides — content starts below top padding
        y: canvas.height * (text.y / 100) + pad,
        maxWidth: Math.max(1, boxW - paddingX),
        fontSize: text.fontSize * fontScale,
        fontFamily: `'${text.fontFamily}', sans-serif`,
        defaultColor: text.color,
        lineHeight,
        textAlign: text.align ?? "center",
        fontWeight: text.fontWeight ?? 700,
      });
    };

    const drawOneShape = async (
      shape: ShapeOverlay,
      renderX: number = shape.x,
    ) => {
      const containerWidth = canvas.width * (shape.width / 100);
      const containerHeight = canvas.height * (shape.height / 100);
      const centerX = canvas.width * (renderX / 100);
      const centerY = canvas.height * (shape.y / 100);
      const rotation = shape.rotation ?? 0;
      // Convert % radius to px (CSS % of shorter side)
      const shorter = Math.min(containerWidth, containerHeight);
      const radiusPx =
        shape.form === "circle"
          ? shorter / 2
          : (Math.max(0, Math.min(50, shape.cornerRadius)) / 100) * shorter;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.min(1, Math.max(0, (shape.opacity ?? 100) / 100));

      if (shape.shadow?.enabled) {
        ctx.shadowColor = shape.shadow.color;
        ctx.shadowBlur = shape.shadow.blur * scaleX;
        ctx.shadowOffsetX = shape.shadow.offsetX * scaleX;
        ctx.shadowOffsetY = shape.shadow.offsetY * scaleX;
      }

      const x0 = -containerWidth / 2;
      const y0 = -containerHeight / 2;
      ctx.beginPath();
      if (shape.form === "circle") {
        ctx.ellipse(0, 0, containerWidth / 2, containerHeight / 2, 0, 0, Math.PI * 2);
      } else {
        const r = Math.min(radiusPx, containerWidth / 2, containerHeight / 2);
        ctx.moveTo(x0 + r, y0);
        ctx.arcTo(x0 + containerWidth, y0, x0 + containerWidth, y0 + containerHeight, r);
        ctx.arcTo(x0 + containerWidth, y0 + containerHeight, x0, y0 + containerHeight, r);
        ctx.arcTo(x0, y0 + containerHeight, x0, y0, r);
        ctx.arcTo(x0, y0, x0 + containerWidth, y0, r);
        ctx.closePath();
      }

      if (shape.fillMode === "image" && shape.fillImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.save();
            ctx.clip();
            const imgAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
            const boxAspect = containerWidth / Math.max(containerHeight, 1);
            let dw: number;
            let dh: number;
            if (imgAspect > boxAspect) {
              dh = containerHeight;
              dw = dh * imgAspect;
            } else {
              dw = containerWidth;
              dh = dw / imgAspect;
            }
            const ox = Math.min(50, Math.max(-50, shape.imageOffsetX ?? 0));
            const oy = Math.min(50, Math.max(-50, shape.imageOffsetY ?? 0));
            const tx = -(ox / 50) * ((dw - containerWidth) / 2);
            const ty = -(oy / 50) * ((dh - containerHeight) / 2);
            ctx.drawImage(img, -dw / 2 + tx, -dh / 2 + ty, dw, dh);
            ctx.restore();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = shape.fillImage!;
        });
      } else {
        ctx.fillStyle = shape.fillColor || "#ffffff";
        ctx.fill();
      }

      ctx.restore();
    };

    const renderableDevices = getRenderableDevicesForScreenshot(screenshots, i);
    const renderableOverlays = getRenderableOverlaysForScreenshot(
      screenshots,
      i,
    );
    const renderableShapes = getRenderableShapesForScreenshot(screenshots, i);
    const layerOrder = ensureLayerOrder(screenshot);

    type PaintJob = { z: number; paint: () => void | Promise<void> };
    const jobs: PaintJob[] = [];

    for (const key of layerOrder) {
      if (key.startsWith("text:")) {
        const textId = key.slice(5);
        const text = (screenshot.texts ?? []).find((t) => t.id === textId);
        if (text && !text.hidden) {
          jobs.push({
            z: zIndexForLayer(layerOrder, key),
            paint: () => drawTextOverlay(text),
          });
        }
      }
      // Images + devices + shapes (owner & guests) via renderable* below
    }

    for (const item of renderableOverlays) {
      if (item.image.hidden) continue;
      jobs.push({
        z: item.layerZIndex,
        paint: () => drawOneOverlay(item.image, item.localX),
      });
    }

    for (const item of renderableShapes) {
      if (item.shape.hidden) continue;
      jobs.push({
        z: item.layerZIndex,
        paint: () => drawOneShape(item.shape, item.localX),
      });
    }

    for (const item of renderableDevices) {
      if (item.device.hidden) continue;
      jobs.push({
        z: item.layerZIndex,
        paint: () =>
          drawDeviceInstance(ctx, canvas, item.device, scaleX, item.localX),
      });
    }

    jobs.sort((a, b) => a.z - b.z);
    for (const job of jobs) {
      await job.paint();
    }

    // Flatten to opaque PNG (no alpha channel)
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const flatCtx = flat.getContext("2d");
    if (!flatCtx) continue;
    flatCtx.fillStyle = "#ffffff";
    flatCtx.fillRect(0, 0, flat.width, flat.height);
    flatCtx.drawImage(canvas, 0, 0);

    exportedFiles.push({
      name: filename,
      data: flat.toDataURL("image/png"),
    });
  }

  return exportedFiles;
};

export const exportScreenshots = async ({
  screenshots,
  exportSizes: sizesArg,
  exportSize,
  designWidth,
  locales,
  resolveLocaleScreenshots,
}: ExportOptions) => {
  await document.fonts.ready;

  // Ensure webfonts used on canvas are ready (extra tick after fonts.ready)
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const sizes =
    sizesArg && sizesArg.length > 0
      ? sizesArg
      : exportSize
        ? [exportSize]
        : [];

  if (sizes.length === 0) {
    throw new Error("Select at least one export size.");
  }

  if (screenshots.length === 0) {
    throw new Error("Add at least one screenshot before exporting.");
  }

  const baseWidth = designWidth || exportSize?.width || sizes[0].width;
  const exportedFiles: { name: string; data: string }[] = [];
  const localeList =
    locales && locales.length > 0 ? locales : ([null] as (string | null)[]);
  const multiLocale = Boolean(locales && locales.length > 1);

  try {
    for (const locale of localeList) {
      const shotsForLocale =
        locale && resolveLocaleScreenshots
          ? resolveLocaleScreenshots(screenshots, locale)
          : screenshots;
      for (const size of sizes) {
        const files = await exportOneSize({
          screenshots: shotsForLocale,
          exportSize: size,
          designWidth: baseWidth,
        });
        for (const file of files) {
          exportedFiles.push({
            ...file,
            name:
              multiLocale && locale
                ? `${locale}/${file.name}`
                : file.name,
          });
        }
      }
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to render screenshots for export.");
  }

  if (exportedFiles.length === 0) {
    throw new Error("Nothing was exported. Check your screenshots and try again.");
  }

  try {
    if (exportedFiles.length === 1 && sizes.length === 1 && !multiLocale) {
      const singleName = getExportFilename(sizes[0], 0, 1);
      downloadFile(exportedFiles[0].data, singleName);
    } else {
      await downloadAsZip(exportedFiles, getExportZipName(sizes));
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Download failed. Check your browser permissions and try again.");
  }
};
