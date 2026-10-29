# AppShots — Agent Guide

## Project Overview

**AppShots** is a client-side React editor for creating App Store and Google Play screenshot sets. Everything runs in the browser: no backend, no accounts, no watermarks.

## Tech Stack

- **Frontend**: React 19, TanStack Router, Tailwind CSS 4, Lucide icons
- **Build**: Vite 7, Bun
- **Export**: Canvas API + JSZip
- **Persistence**: localStorage (autosave) + `.appshots` project files (ZIP)
- **Testing**: Vitest

## Project Structure

```
src/
├── components/
│   ├── CanvasPreview/     # Canvas, ScreenshotCard, devices, overlays, text
│   ├── DeviceFrame/       # Flat + 3D device mockups
│   ├── FontPicker/        # Google Fonts picker
│   ├── LeftSidebar/       # Projects, device model/color, export
│   ├── RightSidebar/      # Layout, background, content, overlays
│   ├── ProjectSwitcher/   # Multi-project + Open/Save .appshots
│   ├── RichTextEditor/    # Rich text formatting
│   ├── EditorLayout.tsx
│   └── ExportSuccessModal.tsx
├── context/
│   └── EditorContext.tsx  # Global editor state & actions
├── lib/
│   ├── device-overflow.ts # Cross-screen device/overlay math
│   ├── export-utils.ts    # PNG/ZIP export
│   ├── project-file.ts    # .appshots open/save (File System Access)
│   ├── rich-text-canvas.ts
│   └── useLocalStorage.ts
├── routes/
│   ├── __root.tsx
│   ├── index.tsx          # Landing + templates
│   └── editor.tsx         # Editor (`/editor?template=…`)
├── types/
├── constants.ts           # Devices, gradients, export sizes
└── main.tsx
```

## Key Behaviors

### Persistence
- Browser autosave → localStorage every ~1s (image blobs in IndexedDB as `idb:` refs)
- Optional disk file → `.appshots` via Open / Save / Save as (Ctrl+S)
- Dirty `•` only when a disk file is linked and unsaved
- Quota full → amber banner + prompt to export `.appshots`

### Export
- Await export before success modal; show Exporting… + errors in Export section
- Multi-size ZIP; single PNG when one size / one shot
- Preview size ≠ frame bezel — export size drives canvas dimensions

### Canvas
- Multi-device + cross-screen overflow
- Texts, overlays, laurels stickers
- Empty device screen → Upload screenshot CTA + drag-drop

## Agent Guidelines

1. Prefer functional React components + TypeScript
2. Use Tailwind utilities; match existing dark editor chrome
3. Keep export preview parity (`export-utils` ↔ canvas)
4. Do not put secrets in the repo
5. Do not invent shadcn/`components/ui` — this app does not use that stack
6. Destructive actions (delete project, leave linked file, reset) use confirms
7. When changing docs, keep README + `public/llms.txt` + this file in sync

## Common Commands

```bash
bun install
bun run dev
bun run build
bun test
```

## Resources

- Live: https://appshots.appstate.xyz/
- Repo: https://github.com/BabiMumba/appshots

---

**Last Updated**: October 2026
**Maintainer**: AppShots
