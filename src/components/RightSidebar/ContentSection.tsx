/**
 * ContentSection — editor for the currently selected text only.
 */

import { useEffect, useRef } from "react";
import type { Screenshot } from "../../types";
import { useEditor } from "../../context/EditorContext";
import { SidebarSection } from "./SidebarSection";
import { RichTextEditor } from "../RichTextEditor";
import { ApplyToAllButton } from "./ApplyToAllButton";

interface ContentSectionProps {
  screenshot: Screenshot;
  onUpdateScreenshot: (updates: Partial<Screenshot>) => void;
  canApplyToAll?: boolean;
  onApplyToAll?: () => void;
}

export const ContentSection = ({
  screenshot,
  canApplyToAll = false,
  onApplyToAll,
}: ContentSectionProps) => {
  const {
    contentFocusRequest,
    clearContentFocusRequest,
    selectedElement,
    updateText,
    addText,
  } = useEditor();
  const editorWrapRef = useRef<HTMLDivElement>(null);

  const textId =
    selectedElement?.screenshotId === screenshot.id &&
    selectedElement.type === "text"
      ? selectedElement.id
      : null;

  const text = textId
    ? (screenshot.texts ?? []).find((t) => t.id === textId)
    : null;

  useEffect(() => {
    if (!contentFocusRequest || contentFocusRequest !== textId) return;
    editorWrapRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    const editable = editorWrapRef.current?.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement | null;
    editable?.focus();
    clearContentFocusRequest();
  }, [contentFocusRequest, clearContentFocusRequest, textId]);

  if (!text || !textId) {
    return (
      <SidebarSection title="Content" sectionId="content">
        <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
          Select a text on the canvas, or add a new one.
        </p>
        <button
          type="button"
          onClick={addText}
          className="w-full text-sm rounded-md bg-white/10 hover:bg-white/15 px-3 py-2 text-gray-100"
        >
          + Add text
        </button>
        {onApplyToAll && (
          <ApplyToAllButton
            label="Apply text style to all screens"
            disabled={!canApplyToAll}
            onClick={onApplyToAll}
          />
        )}
      </SidebarSection>
    );
  }

  return (
    <SidebarSection title="Content" sectionId="content">
      <div ref={editorWrapRef}>
        <label className="block text-xs text-gray-400 mb-1">Selected text</label>
        <RichTextEditor
          value={text.content}
          onChange={(html) => {
            updateText(textId, { content: html });
          }}
          placeholder="Enter text..."
        />
      </div>
      {onApplyToAll && (
        <ApplyToAllButton
          label="Apply text style to all screens"
          disabled={!canApplyToAll}
          onClick={onApplyToAll}
        />
      )}
    </SidebarSection>
  );
};
