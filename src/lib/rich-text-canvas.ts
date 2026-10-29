/**
 * Rich Text Canvas Renderer
 * Parses HTML formatted text and renders it on a canvas with proper styling
 */

import {
  RICH_TEXT_HIGHLIGHT_HEIGHT_EM,
  RICH_TEXT_HIGHLIGHT_RADIUS_EM,
  RICH_TEXT_HIGHLIGHT_SPREAD_EM,
  RICH_TEXT_HIGHLIGHT_TOP_OFFSET_EM,
} from "./rich-text-highlight";

export interface StyledSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  backgroundColor: string | null;
}

export interface RenderOptions {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  defaultColor: string;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  fontWeight?: number;
}

/**
 * Parse HTML string into styled segments
 */
export function parseRichText(html: string, defaultColor: string): StyledSegment[] {
  const segments: StyledSegment[] = [];
  
  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstChild;
  
  if (!root) {
    return [
      {
        text: html,
        bold: false,
        italic: false,
        underline: false,
        color: defaultColor,
        backgroundColor: null,
      },
    ];
  }

  interface StyleState {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color: string;
    backgroundColor: string | null;
  }

  const pushNewline = (state: StyleState) => {
    const last = segments[segments.length - 1];
    if (last?.text === "\n") return;
    segments.push({
      text: "\n",
      bold: state.bold,
      italic: state.italic,
      underline: state.underline,
      color: state.color,
      backgroundColor: state.backgroundColor,
    });
  };

  const isBlockTag = (tagName: string) =>
    tagName === "div" ||
    tagName === "p" ||
    tagName === "li" ||
    tagName === "h1" ||
    tagName === "h2" ||
    tagName === "h3" ||
    tagName === "h4" ||
    tagName === "h5" ||
    tagName === "h6" ||
    tagName === "tr" ||
    tagName === "blockquote";

  // True once any visible text (or explicit break) was emitted — used so a
  // leading <div> from contenteditable does not insert a blank first line.
  let hasContent = false;

  // Recursively walk the DOM tree
  function walkNode(node: Node, state: StyleState) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text) {
        segments.push({
          text,
          bold: state.bold,
          italic: state.italic,
          underline: state.underline,
          color: state.color,
          backgroundColor: state.backgroundColor,
        });
        hasContent = true;
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Clone state for children
      const childState: StyleState = { ...state };

      // Update state based on tag
      switch (tagName) {
        case "b":
        case "strong":
          childState.bold = true;
          break;
        case "i":
        case "em":
          childState.italic = true;
          break;
        case "u":
          childState.underline = true;
          break;
        case "font": {
          const fontColor = element.getAttribute("color");
          if (fontColor) {
            childState.color = fontColor;
          }
          if (element.style.backgroundColor) {
            childState.backgroundColor = element.style.backgroundColor;
          }
          break;
        }
        case "mark":
          childState.backgroundColor = element.style.backgroundColor || "yellow";
          break;
        case "span": {
          // Check inline styles
          const style = element.style;
          if (style.fontWeight === "bold" || parseInt(style.fontWeight) >= 700) {
            childState.bold = true;
          }
          if (style.fontStyle === "italic") {
            childState.italic = true;
          }
          if (style.textDecoration?.includes("underline")) {
            childState.underline = true;
          }
          if (style.color) {
            childState.color = style.color;
          }
          if (style.backgroundColor) {
            childState.backgroundColor = style.backgroundColor;
          }
          break;
        }
        case "br":
          pushNewline(state);
          hasContent = true;
          return;
      }

      // contenteditable Enter → <div>/<p> blocks; mirror CSS block layout
      if (isBlockTag(tagName) && hasContent) {
        pushNewline(state);
      }

      // Process children
      for (const child of Array.from(node.childNodes)) {
        walkNode(child, childState);
      }
    }
  }

  walkNode(root, {
    bold: false,
    italic: false,
    underline: false,
    color: defaultColor,
    backgroundColor: null,
  });

  return segments;
}

/**
 * Get plain text from HTML (for measurement purposes)
 */
export function getPlainText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  return doc.body.textContent || html;
}

/**
 * Measure with the same engine as fillText — CSS span metrics were drifting
 * from canvas glyphs (overlap / "betwee" clips on store exports).
 */
function measureTextWidth(
  text: string,
  font: string,
  ctx: CanvasRenderingContext2D,
): number {
  ctx.font = font;
  return ctx.measureText(text).width;
}

/** Load faces used by texts at the exact export pixel size before measure/draw. */
export async function ensureTextFontsLoaded(
  texts: { fontFamily: string; fontSize: number; fontWeight?: number }[],
): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  await document.fonts.ready;
  await Promise.all(
    texts.map((t) => {
      const weight = t.fontWeight ?? 700;
      const family = t.fontFamily.includes("'")
        ? t.fontFamily
        : `'${t.fontFamily}'`;
      const spec = `${weight} ${Math.max(1, Math.ceil(t.fontSize))}px ${family}, sans-serif`;
      return document.fonts.load(spec).catch(() => undefined);
    }),
  );
}

/**
 * Render rich text segments onto a canvas
 */
export function renderRichText(
  ctx: CanvasRenderingContext2D,
  segments: StyledSegment[],
  options: RenderOptions
): number {
  const {
    x,
    y,
    maxWidth,
    fontSize,
    fontFamily,
    lineHeight,
    textAlign,
    fontWeight = 400,
  } = options;

  // Build font string for a segment — match TextElement (font-bold / font-semibold)
  const buildFont = (segment: StyledSegment): string => {
    const weight = segment.bold ? 700 : fontWeight;
    const style = segment.italic ? "italic" : "normal";
    return `${style} ${weight} ${fontSize}px ${fontFamily}`;
  };

  const measureSegment = (segment: StyledSegment): number => {
    return measureTextWidth(segment.text, buildFont(segment), ctx);
  };

  /** CSS overflow-wrap: break-word — split an overlong word into fitting chunks. */
  const breakWordToFit = (word: Word, available: number): Word[] => {
    if (word.width <= available || word.segments.length === 0) return [word];
    const chunks: Word[] = [];
    let segs: StyledSegment[] = [];
    let width = 0;

    const flush = () => {
      if (segs.length === 0) return;
      chunks.push({ segments: segs, width, isNewline: false });
      segs = [];
      width = 0;
    };

    for (const segment of word.segments) {
      for (const ch of segment.text) {
        const piece = { ...segment, text: ch };
        const w = measureSegment(piece);
        if (segs.length > 0 && width + w > available) {
          flush();
        }
        // Always place at least one character even if wider than available
        segs.push(piece);
        width += w;
      }
    }
    flush();
    return chunks.length > 0 ? chunks : [word];
  };

  const drawRoundedHighlight = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
  ) => {
    const clampedRadius = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, clampedRadius);
    ctx.fillStyle = color;
    ctx.fill();
  };

  // Split segments into words while preserving styling
  interface Word {
    segments: StyledSegment[];
    width: number;
    isNewline: boolean;
  }

  const words: Word[] = [];
  let currentWord: StyledSegment[] = [];
  let currentWordWidth = 0;

  for (const segment of segments) {
    if (segment.text === "\n") {
      // Push current word if any
      if (currentWord.length > 0) {
        words.push({ segments: currentWord, width: currentWordWidth, isNewline: false });
        currentWord = [];
        currentWordWidth = 0;
      }
      // Add newline marker
      words.push({ segments: [], width: 0, isNewline: true });
      continue;
    }

    // Split segment text by spaces
    const parts = segment.text.split(/( )/);
    
    for (const part of parts) {
      if (part === " ") {
        // Space ends a word
        if (currentWord.length > 0) {
          words.push({ segments: currentWord, width: currentWordWidth, isNewline: false });
          currentWord = [];
          currentWordWidth = 0;
        }
        // Add space as its own word
        const spaceSegment = { ...segment, text: " " };
        const spaceWidth = measureSegment(spaceSegment);
        words.push({ segments: [spaceSegment], width: spaceWidth, isNewline: false });
      } else if (part) {
        // Add to current word
        const partSegment = { ...segment, text: part };
        const partWidth = measureSegment(partSegment);
        currentWord.push(partSegment);
        currentWordWidth += partWidth;
      }
    }
  }

  // Don't forget the last word
  if (currentWord.length > 0) {
    words.push({ segments: currentWord, width: currentWordWidth, isNewline: false });
  }

  // Group words into lines
  interface Line {
    words: Word[];
    width: number;
  }

  const lines: Line[] = [];
  let currentLine: Word[] = [];
  let currentLineWidth = 0;

  for (const word of words) {
    if (word.isNewline) {
      lines.push({ words: currentLine, width: currentLineWidth });
      currentLine = [];
      currentLineWidth = 0;
      continue;
    }

    const wordWidth = word.width;
    const isSpaceOnly =
      word.segments.length === 1 && word.segments[0].text === " ";

    if (isSpaceOnly) {
      if (currentLine.length === 0) continue; // drop leading wrap spaces
      if (currentLineWidth + wordWidth <= maxWidth) {
        currentLine.push(word);
        currentLineWidth += wordWidth;
      } else {
        lines.push({ words: currentLine, width: currentLineWidth });
        currentLine = [];
        currentLineWidth = 0;
      }
      continue;
    }

    if (currentLineWidth + wordWidth <= maxWidth) {
      currentLine.push(word);
      currentLineWidth += wordWidth;
      continue;
    }

    // Soft wrap — start a new line (CSS drops the wrapping space)
    if (currentLine.length > 0) {
      lines.push({ words: currentLine, width: currentLineWidth });
      currentLine = [];
      currentLineWidth = 0;
    }

    // overflow-wrap: break-word when the word alone exceeds maxWidth
    if (wordWidth > maxWidth) {
      const parts = breakWordToFit(word, maxWidth);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i < parts.length - 1) {
          lines.push({ words: [part], width: part.width });
        } else {
          currentLine = [part];
          currentLineWidth = part.width;
        }
      }
    } else {
      currentLine = [word];
      currentLineWidth = wordWidth;
    }
  }

  // Don't forget the last line
  if (currentLine.length > 0) {
    lines.push({ words: currentLine, width: currentLineWidth });
  }

  // Render lines
  let currentY = y;
  ctx.textBaseline = "top";

  for (const line of lines) {
    // Calculate starting X based on alignment
    let lineX: number;
    
    // Trim trailing spaces from line width calculation
    let trimmedWidth = line.width;
    const lastWord = line.words[line.words.length - 1];
    if (lastWord && lastWord.segments.length === 1 && lastWord.segments[0].text === " ") {
      trimmedWidth -= lastWord.width;
    }

    switch (textAlign) {
      case "center":
        lineX = x - trimmedWidth / 2;
        break;
      case "right":
        lineX = x - trimmedWidth;
        break;
      default:
        lineX = x - maxWidth / 2; // left align from center point
    }

    // Resolve line segments before drawing so highlight backgrounds can span
    // multiple words and spaces on the same line.
    interface PositionedSegment {
      segment: StyledSegment;
      x: number;
      width: number;
    }

    const positionedSegments: PositionedSegment[] = [];
    let currentX = lineX;

    for (const word of line.words) {
      for (const segment of word.segments) {
        const font = buildFont(segment);
        const width = measureTextWidth(segment.text, font, ctx);
        positionedSegments.push({ segment, x: currentX, width });
        currentX += width;
      }
    }

    const highlightSpread = fontSize * RICH_TEXT_HIGHLIGHT_SPREAD_EM;
    const highlightRadius = fontSize * RICH_TEXT_HIGHLIGHT_RADIUS_EM;
    const highlightY =
      currentY + fontSize * RICH_TEXT_HIGHLIGHT_TOP_OFFSET_EM - highlightSpread;
    const highlightHeight =
      fontSize * RICH_TEXT_HIGHLIGHT_HEIGHT_EM + highlightSpread * 2;

    interface HighlightRun {
      x: number;
      width: number;
      color: string;
    }

    const highlightRuns: HighlightRun[] = [];
    let currentRun: HighlightRun | null = null;

    for (const positionedSegment of positionedSegments) {
      const { segment, x, width } = positionedSegment;

      if (!segment.backgroundColor || width <= 0) {
        if (currentRun) {
          highlightRuns.push(currentRun);
          currentRun = null;
        }
        continue;
      }

      if (
        currentRun &&
        currentRun.color === segment.backgroundColor &&
        Math.abs(currentRun.x + currentRun.width - x) < 0.01
      ) {
        currentRun.width += width;
        continue;
      }

      if (currentRun) {
        highlightRuns.push(currentRun);
      }

      currentRun = {
        x,
        width,
        color: segment.backgroundColor,
      };
    }

    if (currentRun) {
      highlightRuns.push(currentRun);
    }

    for (const highlightRun of highlightRuns) {
      drawRoundedHighlight(
        highlightRun.x - highlightSpread,
        highlightY,
        highlightRun.width + highlightSpread * 2,
        highlightHeight,
        highlightRadius,
        highlightRun.color,
      );
    }

    for (const positionedSegment of positionedSegments) {
      const { segment, x, width } = positionedSegment;

      ctx.fillStyle = segment.color;
      ctx.fillText(segment.text, x, currentY);

      // Draw underline if needed
      if (segment.underline) {
        const underlineY = currentY + fontSize * 0.9;
        ctx.strokeStyle = segment.color;
        ctx.lineWidth = Math.max(1, fontSize / 15);
        ctx.beginPath();
        ctx.moveTo(x, underlineY);
        ctx.lineTo(x + width, underlineY);
        ctx.stroke();
      }
    }

    currentY += fontSize * lineHeight;
  }

  // Return the total height used
  return lines.length * fontSize * lineHeight;
}

/**
 * Convenience function to parse and render in one call
 */
export function drawRichText(
  ctx: CanvasRenderingContext2D,
  html: string,
  options: RenderOptions
): number {
  const segments = parseRichText(html, options.defaultColor);
  return renderRichText(ctx, segments, options);
}
