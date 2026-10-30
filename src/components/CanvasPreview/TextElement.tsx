/**
 * TextElement — draggable / inline-editable text overlay.
 */

import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { TextAlign } from "../../types";
import { getTextSelectionStyles } from "./utils";
import {
  normalizeRichTextHighlightRoot,
  normalizeRichTextHighlights,
} from "../../lib/rich-text-highlight";
import { textAlignClass } from "../../lib/text-align";
import { SelectionHandles } from "./SelectionHandles";

interface TextElementProps {
  content: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  align: TextAlign;
  uppercase?: boolean;
  fontWeight?: 600 | 700;
  zIndex: number;
  paddingPx?: number;
  isSelected: boolean;
  isInteractive: boolean;
  isEditing?: boolean;
  onMouseDown: (e: ReactMouseEvent) => void;
  onDoubleClick?: (e: ReactMouseEvent) => void;
  onContentChange?: (html: string) => void;
  onEditEnd?: () => void;
  onResizeStart?: (
    e: ReactMouseEvent,
    handle: "e" | "w" | "se" | "sw" | "ne" | "nw",
  ) => void;
  onContextMenu?: (e: ReactMouseEvent) => void;
}

const placeCaretFromPoint = (
  el: HTMLElement,
  clientX: number,
  clientY: number,
) => {
  const selection = window.getSelection();
  if (!selection) return;

  // Chromium / WebKit
  const caretFromPoint =
    (
      document as Document & {
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
        caretPositionFromPoint?: (
          x: number,
          y: number,
        ) => { offsetNode: Node; offset: number } | null;
      }
    );

  let range: Range | null = null;
  if (typeof caretFromPoint.caretRangeFromPoint === "function") {
    range = caretFromPoint.caretRangeFromPoint(clientX, clientY);
  } else if (typeof caretFromPoint.caretPositionFromPoint === "function") {
    const pos = caretFromPoint.caretPositionFromPoint(clientX, clientY);
    if (pos) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
    }
  }

  if (range && el.contains(range.startContainer)) {
    selection.removeAllRanges();
    selection.addRange(range);
    return;
  }

  // Fallback: caret at end
  range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

export const TextElement = ({
  content,
  x,
  y,
  width,
  fontSize,
  color,
  fontFamily,
  align,
  uppercase = false,
  fontWeight = 700,
  zIndex,
  paddingPx = 4,
  isSelected,
  isInteractive,
  isEditing = false,
  onMouseDown,
  onDoubleClick,
  onContentChange,
  onEditEnd,
  onResizeStart,
  onContextMenu,
}: TextElementProps) => {
  const normalizedContent = normalizeRichTextHighlights(content);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedHtml = useRef(content);
  const editPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isEditing || !editorRef.current) return;
    const el = editorRef.current;
    const initial = normalizeRichTextHighlights(content);
    el.innerHTML = initial;
    lastEmittedHtml.current = initial;
    el.focus();
    const point = editPointRef.current ?? lastPointerRef.current;
    editPointRef.current = null;
    if (point) {
      placeCaretFromPoint(el, point.x, point.y);
    } else {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing || !editorRef.current) return;
    const next = normalizeRichTextHighlights(content);
    if (next === lastEmittedHtml.current) return;
    if (editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
      lastEmittedHtml.current = next;
    }
  }, [content, isEditing]);

  const commitFromEditor = () => {
    if (!editorRef.current || !onContentChange) return;
    normalizeRichTextHighlightRoot(editorRef.current);
    const html = editorRef.current.innerHTML;
    lastEmittedHtml.current = html;
    onContentChange(html);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      commitFromEditor();
      editorRef.current?.blur();
      onEditEnd?.();
    }
    e.stopPropagation();
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      return;
    }
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    if (isInteractive) onMouseDown(e);
  };

  const handleDoubleClick = (e: ReactMouseEvent) => {
    if (!isInteractive || isEditing || !onDoubleClick) return;
    e.preventDefault();
    e.stopPropagation();
    editPointRef.current = { x: e.clientX, y: e.clientY };
    onDoubleClick(e);
  };

  return (
    <div
      data-draggable-element="text"
      data-inline-editing={isEditing ? "true" : undefined}
      className={`absolute whitespace-pre-wrap ${
        isEditing ? "cursor-text select-text" : "cursor-move select-none"
      } ${textAlignClass(align)}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translateX(-50%)",
        width: `${width}%`,
        maxWidth: `${width}%`,
        fontSize: `${fontSize}px`,
        fontWeight,
        lineHeight: 1.1,
        color,
        fontFamily: `'${fontFamily}', sans-serif`,
        textTransform: uppercase ? "uppercase" : "none",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        // Match export: ink must stay in the text box (no silent overflow)
        overflow: "hidden",
        boxSizing: "border-box",
        zIndex: isEditing ? Math.max(zIndex, 250) : zIndex,
        padding: `${paddingPx}px`,
        borderRadius: `${Math.max(2, paddingPx)}px`,
        ...(isEditing
          ? {
              outline: "2px solid rgba(99, 102, 241, 0.95)",
              outlineOffset: "2px",
              boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.25)",
              background: "transparent",
            }
          : getTextSelectionStyles(isSelected)),
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={isInteractive ? onContextMenu : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {isEditing ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="outline-none overflow-hidden min-h-[1em] caret-white"
          onInput={commitFromEditor}
          onBlur={() => {
            commitFromEditor();
            onEditEnd?.();
          }}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="overflow-hidden"
          dangerouslySetInnerHTML={{ __html: normalizedContent }}
        />
      )}
      {isSelected && isInteractive && !isEditing && (
        <SelectionHandles
          showCorners={false}
          showSideHandles
          showRotation={false}
          onResizeStart={onResizeStart}
        />
      )}
    </div>
  );
};
