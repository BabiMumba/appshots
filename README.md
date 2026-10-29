# AppShots

A free, open-source tool to create high-converting screenshots for the Apple App Store and Google Play Store. Design professional app previews with an intuitive drag-and-drop editor — entirely in the browser.

🔗 **Live Demo:** [appshots.appstate.xyz](https://appshots.appstate.xyz/)

![App Store Screenshot Generator](public/demo-image.png)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?logo=tailwindcss)

## Features

### Device Frames

- **Modern device mockups** — iPhone 17 Pro Max / Pro / 17, iPhone 15 Pro Max / Pro, iPhone 14, iPad Pro 12.9", Pixel 9 / 9 Pro, Samsung Galaxy S24 Ultra, Galaxy Tab S9
- **Multiple colors per device** — Cosmic Orange, Deep Blue, Titanium, Midnight, and more
- **Multi-device compositions** — add, select, reorder, and style independent devices in one screenshot
- **Cross-screen overflow** — drag devices past the edge to continue into adjacent screenshots
- **Flat & 3D modes** — classic 2D frames or perspective 3D with visible edges
- **Accurate camera elements** — Dynamic Island, notch, and punch-hole

### Backgrounds & Appearance

- Solid colors, gradient presets, custom gradients, and background images

### Rich Text & Fonts

- Unlimited text overlays with bold, italic, underline, color, alignment, and rounded highlights
- Google Fonts search and preview
- Drag, resize, and inline-edit on the canvas

### Overlay Images

- Upload badges, logos, decorations; built-in laurel stickers
- Drag, resize, rotate, layer order, per-image shadow

### Screenshot Image

- Upload or drop an image onto an empty device frame
- Per-device zoom and pan

### Layout & Positioning

- Position presets, scale, offset, flat/3D rotation, device shadow

### Project Management

- Multiple projects — create, rename, switch, delete (with confirms)
- **Autosave** to localStorage in the browser
- **`.appshots` files** — Open / Save / Save as (Ctrl+S); Chrome/Edge can overwrite a linked file
- Dirty indicator only when a disk file is linked and unsaved

### Export

- Batch export (ZIP for multiple files, PNG for a single file)
- Full **App Store + Play** size matrix (required and optional slots)
- Loading state while exporting; success only after download finishes
- Post-export success popup with optional project rename
- 3D and cross-screen layouts preserved in exports

### Editor Experience

- Multi-screenshot gallery, real-time preview, undo/redo
- Selection, context menus, keyboard delete/nudge
- Dark editor UI

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
git clone https://github.com/BabiMumba/appshots.git
cd appshots

bun install
bun run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
bun run build
```

Built files land in `dist/`.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Runtime**: [Bun](https://bun.sh/)
- **ZIP**: [JSZip](https://stuk.github.io/jszip/)

## Project Structure

```
src/
├── components/
│   ├── CanvasPreview/         # Canvas, cards, devices, overlays, text
│   ├── DeviceFrame/           # Flat 2D & 3D mockups
│   ├── FontPicker/            # Google Fonts
│   ├── LeftSidebar/           # Projects, device, export
│   ├── ProjectSwitcher/       # Multi-project + .appshots IO
│   ├── RichTextEditor/        # Rich text toolbar
│   ├── RightSidebar/          # Layout, background, content, overlays
│   ├── EditorLayout.tsx
│   └── ExportSuccessModal.tsx
├── context/
│   └── EditorContext.tsx      # Global editor state
├── lib/
│   ├── device-overflow.ts     # Cross-screen layout math
│   ├── export-utils.ts        # PNG / ZIP export
│   ├── project-file.ts        # .appshots open/save
│   ├── rich-text-canvas.ts    # Text → canvas for export
│   └── useLocalStorage.ts     # Browser persistence
├── routes/
│   ├── __root.tsx
│   └── index.tsx              # Editor
├── types/
├── constants.ts               # Devices, gradients, export sizes
└── main.tsx
```

## Usage

1. **Select a device** — left sidebar model + color
2. **Upload a screenshot** — click Upload on an empty frame, drop an image, or use the right sidebar
3. **Add devices / screens** — multi-device layouts and a full store set
4. **Edit text** — click text on canvas; format with the toolbar
5. **Background & overlays** — solid, gradient, image, laurels, logos
6. **Position** — presets or manual scale / offset / 3D
7. **Save** — autosaved in the browser; use Save / Save as for a `.appshots` file
8. **Export** — pick preview size (+ optional extra sizes), then download PNG/ZIP

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add some amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [TanStack](https://tanstack.com/) — router & tooling
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/)
- [Google Fonts](https://fonts.google.com/)

## Contact

- [Issues](https://github.com/BabiMumba/appshots/issues) for bugs and ideas

---

Made for iOS and Android developers
