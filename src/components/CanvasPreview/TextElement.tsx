/**
 * TextElement — draggable / inline-editable text overlay.
 */

import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
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

  useEffect(() => {
    if (!isEditing || !editorRef.current) return;
    const el = editorRef.current;
    const initial = normalizeRichTextHighlights(content);
    el.innerHTML = initial;
    lastEmittedHtml.current = initial;
    el.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
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
    if (isInteractive) onMouseDown(e);
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
      onDoubleClick={
        isInteractive && !isEditing ? onDoubleClick : undefined
      }
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
