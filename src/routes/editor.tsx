import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadGoogleFonts } from "../lib/google-fonts";
import { EditorProvider } from "../context/EditorContext";
import { EditorLayout } from "../components/EditorLayout";
import { isTemplateId, type TemplateId } from "../lib/templates";
import type { ExportAssetKind } from "../types";

type EditorSearch = {
  template?: TemplateId;
  mode?: ExportAssetKind;
};

const RouteComponent = () => {
  const { template, mode } = Route.useSearch();

  useEffect(() => {
    loadGoogleFonts();
  }, []);

  return (
    <EditorProvider initialTemplateId={template} initialAssetMode={mode}>
      <EditorLayout />
    </EditorProvider>
  );
};

export const Route = createFileRoute("/editor")({
  validateSearch: (search: Record<string, unknown>): EditorSearch => {
    const out: EditorSearch = {};
    const rawTemplate =
      typeof search.template === "string" ? search.template : undefined;
    if (isTemplateId(rawTemplate)) out.template = rawTemplate;
    if (search.mode === "feature" || search.mode === "screenshot") {
      out.mode = search.mode;
    }
    return out;
  },
  component: RouteComponent,
});
