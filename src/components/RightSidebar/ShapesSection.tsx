/**
 * ShapesSection — floating blocks (cards / circles) for marketing layouts.
 */

import { useRef } from "react";
import type { Screenshot, SelectedElement, ShapeOverlay } from "../../types";
import { SHAPE_FORMS } from "../../lib/shapes";
import { SidebarSection } from "./SidebarSection";
import { RangeSlider } from "./RangeSlider";
import { Toggle } from "./Toggle";
import { STYLES, SLIDER_RANGES } from "./constants";

interface ShapesSectionProps {
  screenshot: Screenshot;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
  onAddShape: (form: ShapeOverlay["form"]) => void;
  onRemoveShape: (id: string) => void;
  onUpdateShape: (id: string, updates: Partial<ShapeOverlay>) => void;
  onSetFillImage: (id: string, file: File) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

export const ShapesSection = ({
  screenshot,
  selectedElement,
  onSelectElement,
  onAddShape,
  onRemoveShape,
  onUpdateShape,
  onSetFillImage,
  onBringForward,
  onSendBackward,
}: ShapesSectionProps) => {
  const fillInputRef = useRef<HTMLInputElement>(null);
  const shapes = screenshot.shapes ?? [];
  const selectedShape =
    selectedElement?.type === "shape" &&
    selectedElement.screenshotId === screenshot.id &&
    selectedElement.id
      ? shapes.find((s) => s.id === selectedElement.id) ?? null
      : null;

  return (
    <SidebarSection title="Shapes" sectionId="shapes">
      <div className="space-y-3">
        <p className="text-[10px] text-[var(--ed-fg-muted)] leading-relaxed">
          Floating blocks over devices — fill with color or an image (cropped
          to the shape).
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          {SHAPE_FORMS.map((form) => (
            <button
              key={form.id}
              type="button"
              onClick={() => onAddShape(form.id)}
              className="rounded-md border border-[var(--ed-border)] bg-[var(--ed-muted)] px-2 py-1.5 text-[11px] text-[var(--ed-fg)] hover:bg-[var(--ed-muted-hover)] transition-colors"
            >
              + {form.label}
            </button>
          ))}
        </div>

        {shapes.length > 0 && (
          <ul className="space-y-1">
            {shapes.map((shape, index) => {
              const selected = selectedShape?.id === shape.id;
              return (
                <li key={shape.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onSelectElement({
                        type: "shape",
                        id: shape.id,
                        screenshotId: screenshot.id,
                      })
                    }
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors ${
                      selected
                        ? "bg-[var(--ed-muted)] ring-1 ring-[var(--ed-fg)]"
                        : "hover:bg-[var(--ed-muted)]"
                    }`}
                  >
                    <span
                      className="h-7 w-7 shrink-0 border border-[var(--ed-border)]"
                      style={{
                        background:
                          shape.fillMode === "image" && shape.fillImage
                            ? `center / cover url(${shape.fillImage})`
                            : shape.fillColor,
                        borderRadius:
                          shape.form === "circle"
                            ? "9999px"
                            : `${Math.min(shape.cornerRadius, 40)}%`,
                      }}
                    />
                    <span className="flex-1 truncate capitalize text-[var(--ed-fg)]">
                      {shape.form}
                      <span className="text-[var(--ed-fg-muted)]">
                        {" "}
                        · {index + 1}
                      </span>
                    </span>
                    <button
                      type="button"
                      title="Bring forward"
                      className={STYLES.iconButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBringForward(shape.id);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Send backward"
                      className={STYLES.iconButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendBackward(shape.id);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      className={STYLES.iconButtonDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveShape(shape.id);
                      }}
                    >
                      ×
                    </button>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {selectedShape && (
          <div className={STYLES.propertiesPanel}>
            <label className="block">
              <span className="text-xs text-[var(--ed-fg-muted)] mb-1.5 block">
                Form
              </span>
              <select
                value={selectedShape.form}
                onChange={(e) =>
                  onUpdateShape(selectedShape.id, {
                    form: e.target.value as ShapeOverlay["form"],
                  })
                }
                className={STYLES.select}
              >
                {SHAPE_FORMS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-1 p-0.5 bg-[var(--ed-surface)] rounded-lg">
              {(["color", "image"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    onUpdateShape(selectedShape.id, { fillMode: mode })
                  }
                  className={`flex-1 text-xs py-1.5 rounded-md capitalize ${
                    selectedShape.fillMode === mode
                      ? STYLES.modeButtonActive
                      : STYLES.modeButtonInactive
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {selectedShape.fillMode === "color" ? (
              <label className="block">
                <span className="text-xs text-[var(--ed-fg-muted)] mb-1.5 block">
                  Fill color
                </span>
                <input
                  type="color"
                  value={selectedShape.fillColor}
                  onChange={(e) =>
                    onUpdateShape(selectedShape.id, {
                      fillColor: e.target.value,
                    })
                  }
                  className={STYLES.colorInput}
                />
              </label>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fillInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onSetFillImage(selectedShape.id, file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className={STYLES.uploadButton}
                  onClick={() => fillInputRef.current?.click()}
                >
                  {selectedShape.fillImage ? "Replace image" : "Upload image"}
                </button>
                {selectedShape.fillImage && (
                  <button
                    type="button"
                    className="text-[10px] text-[var(--ed-fg-muted)] underline"
                    onClick={() =>
                      onUpdateShape(selectedShape.id, {
                        fillMode: "color",
                        fillImage: null,
                      })
                    }
                  >
                    Clear image
                  </button>
                )}
              </div>
            )}

            {selectedShape.form !== "circle" && (
              <RangeSlider
                label="Corner radius"
                value={selectedShape.cornerRadius}
                min={0}
                max={50}
                onChange={(cornerRadius) =>
                  onUpdateShape(selectedShape.id, { cornerRadius })
                }
              />
            )}

            <RangeSlider
              label="Opacity"
              value={selectedShape.opacity ?? 100}
              min={0}
              max={100}
              unit="%"
              onChange={(opacity) =>
                onUpdateShape(selectedShape.id, { opacity })
              }
            />

            <RangeSlider
              label="Size"
              value={selectedShape.width}
              min={SLIDER_RANGES.imageSize.min}
              max={SLIDER_RANGES.imageSize.max}
              onChange={(width) => {
                const ratio =
                  selectedShape.width > 0
                    ? selectedShape.height / selectedShape.width
                    : 1;
                onUpdateShape(selectedShape.id, {
                  width,
                  height: Math.min(90, Math.max(5, width * ratio)),
                });
              }}
              showValue={false}
            />

            <label className="block">
              <span className="text-xs text-[var(--ed-fg-muted)] mb-1.5 block">
                Layer
              </span>
              <select
                value={selectedShape.layer}
                onChange={(e) =>
                  onUpdateShape(selectedShape.id, {
                    layer: e.target.value === "behind" ? "behind" : "front",
                  })
                }
                className={STYLES.select}
              >
                <option value="front">In front of device</option>
                <option value="behind">Behind device</option>
              </select>
            </label>

            <div className="pt-1 border-t border-[var(--ed-border)] space-y-2">
              <Toggle
                label="Shadow"
                enabled={Boolean(selectedShape.shadow?.enabled)}
                onChange={(enabled) =>
                  onUpdateShape(selectedShape.id, {
                    shadow: { ...selectedShape.shadow, enabled },
                  })
                }
              />
              {selectedShape.shadow?.enabled && (
                <RangeSlider
                  label="Blur"
                  value={selectedShape.shadow.blur}
                  min={SLIDER_RANGES.shadowBlur.min}
                  max={SLIDER_RANGES.shadowBlur.max}
                  unit="px"
                  onChange={(blur) =>
                    onUpdateShape(selectedShape.id, {
                      shadow: { ...selectedShape.shadow, blur },
                    })
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarSection>
  );
};
