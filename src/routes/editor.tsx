import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadGoogleFonts } from "../lib/google-fonts";
import { EditorProvider } from "../context/EditorContext";
import { EditorLayout } from "../components/EditorLayout";
import { isTemplateId, type TemplateId } from "../lib/templates";

type EditorSearch = {
  template?: TemplateId;
};

const RouteComponent = () => {
  const { template } = Route.useSearch();

  useEffect(() => {
    loadGoogleFonts();
  }, []);

  return (
    <EditorProvider initialTemplateId={template}>
      <EditorLayout />
    </EditorProvider>
  );
};

export const Route = createFileRoute("/editor")({
  validateSearch: (search: Record<string, unknown>): EditorSearch => {
    const raw = typeof search.template === "string" ? search.template : undefined;
    return isTemplateId(raw) ? { template: raw } : {};
  },
  component: RouteComponent,
});
