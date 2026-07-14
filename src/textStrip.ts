import type { TickerFont, TickerOptions, TickerRun } from "./types";
import { get2dContext } from "./utils";

export type TextStrip = {
  canvas: HTMLCanvasElement;
  cssHeight: number;
  cssWidth: number;
  midline: number;
  repeatSourceStart: number;
  repeatSourceWidth: number;
  scale: number;
  textureRows: number;
  textureRowWidth: number;
  visibleEnd: number;
  visibleStart: number;
};

type FontMetrics = {
  ascent: number;
  baseline: number;
  descent: number;
};

type GlyphBounds = {
  ascent: number;
  descent: number;
};

type LaidOutGlyph = {
  advance: number;
  glyph: string;
  localX: number;
  logicalEnd: number;
  logicalStart: number;
  row: number;
  run: TickerRun;
  visible: boolean;
  width: number;
};

type LaidOutSegment = {
  end: number;
  row: number;
  run: TickerRun;
  start: number;
};

type TextLayout = {
  backgroundSegments: LaidOutSegment[];
  cssWidth: number;
  glyphs: LaidOutGlyph[];
  rowCount: number;
  rowWidth: number;
  underlineSegments: LaidOutSegment[];
  visibleEnd: number;
  visibleStart: number;
};

export function renderTextStrip(
  options: TickerOptions,
  dpr: number,
  maxTextureSize = 8192,
): TextStrip {
  const scale = Math.min(dpr, 2);
  const measureCanvas = document.createElement("canvas");
  const measureContext = get2dContext(measureCanvas);
  const fullWidth = Math.ceil(measureFullWidth(measureContext, options));
  const maxTextureCssWidth = Math.max(1, Math.floor(maxTextureSize / scale));
  const layout = layoutText(
    measureContext,
    options,
    Math.min(fullWidth, maxTextureCssWidth),
  );
  const metrics = measureFontMetrics(measureContext, options.font, options);
  const cssWidth = Math.ceil(layout.cssWidth);
  const cssHeight = Math.ceil(options.font.lineHeight + options.stripPaddingY * 2);
  const repeatSourceStart = Math.min(options.stripPaddingX, cssWidth);
  const repeatSourceWidth = Math.max(
    1,
    cssWidth - repeatSourceStart - options.stripPaddingX,
  );
  const textureRowWidth = Math.ceil(layout.rowWidth);
  const textureRows = layout.rowCount;
  const stripCanvas = document.createElement("canvas");
  const stripContext = get2dContext(stripCanvas);

  stripCanvas.width = Math.ceil(textureRowWidth * scale);
  stripCanvas.height = Math.ceil(cssHeight * textureRows * scale);
  stripContext.scale(scale, scale);
  stripContext.textBaseline = "alphabetic";
  stripContext.imageSmoothingEnabled = true;
  stripContext.imageSmoothingQuality = "high";

  options.runs.forEach((run) => {
    const runGlyphs = layout.glyphs.filter((glyph) => glyph.run === run);
    const runTextSegments = mergeSegments(
      runGlyphs.map((glyph) => ({
        end: glyph.localX + glyph.advance,
        row: glyph.row,
        run,
        start: glyph.localX,
      })),
    );

    if (run.background) {
      const backgroundSegments = mergeSegments(
        layout.backgroundSegments.filter((segment) => segment.run === run),
      );
      const glyphBounds = measureGlyphBounds(measureContext, options.font, run);

      backgroundSegments.forEach((segment) => {
        drawBackgroundSegment(
          stripContext,
          segment,
          metrics.baseline,
          glyphBounds,
          cssHeight,
          options,
          run.background as string,
        );
      });
    }

    stripContext.font = getCanvasFont(options.font, run);
    stripContext.fillStyle = run.fill || "#111111";
    stripContext.globalCompositeOperation = run.punchOut
      ? "destination-out"
      : "source-over";
    runGlyphs.forEach((glyph) => {
      drawGlyph(
        stripContext,
        glyph,
        runTextSegments,
        metrics,
        cssHeight,
        options,
      );
    });

    if (run.underline) {
      drawUnderlineSegments(
        stripContext,
        mergeSegments(
          layout.underlineSegments.filter((segment) => segment.run === run),
        ),
        metrics,
        cssHeight,
        options,
        run.fill || "#111111",
        run,
      );
    }

    stripContext.globalCompositeOperation = "source-over";
  });

  return {
    canvas: stripCanvas,
    cssHeight,
    cssWidth,
    midline: cssHeight / 2,
    repeatSourceStart,
    repeatSourceWidth,
    scale,
    textureRows,
    textureRowWidth,
    visibleEnd: layout.visibleEnd,
    visibleStart: layout.visibleStart,
  };
}

function measureFullWidth(
  context: CanvasRenderingContext2D,
  options: TickerOptions,
) {
  return (
    options.stripPaddingX * 2 +
    options.runs.reduce(
      (total, run) =>
        total +
        measureRun(context, run, options),
      0,
    )
  );
}

function layoutText(
  context: CanvasRenderingContext2D,
  options: TickerOptions,
  rowWidth: number,
): TextLayout {
  const glyphs: LaidOutGlyph[] = [];
  const backgroundSegments: LaidOutSegment[] = [];
  const underlineSegments: LaidOutSegment[] = [];
  let cursor = options.stripPaddingX;
  let visibleStart = Number.POSITIVE_INFINITY;
  let visibleEnd = Number.NEGATIVE_INFINITY;

  function markVisible(start: number, end: number) {
    visibleStart = Math.min(visibleStart, start);
    visibleEnd = Math.max(visibleEnd, end);
  }

  options.runs.forEach((run) => {
    const tracking = run.tracking ?? options.letterSpacing;
    const runGlyphs = Array.from(run.text);

    context.font = getCanvasFont(options.font, run);

    runGlyphs.forEach((glyph, index) => {
      const width = context.measureText(glyph).width;
      const gap = index < runGlyphs.length - 1 ? tracking : 0;
      const advance = width + gap;
      const rowStart = Math.floor(cursor / rowWidth) * rowWidth;
      const localX = cursor - rowStart;

      if (localX > 0 && localX + Math.max(width, advance) > rowWidth) {
        cursor = rowStart + rowWidth;
      }

      const row = Math.floor(cursor / rowWidth);
      const logicalStart = cursor;
      const localStart = cursor - row * rowWidth;
      const logicalEnd = cursor + advance;
      const visible = glyph.trim().length > 0;
      const laidOutGlyph = {
        advance,
        glyph,
        localX: localStart,
        logicalEnd,
        logicalStart,
        row,
        run,
        visible,
        width,
      };

      glyphs.push(laidOutGlyph);

      if (run.background && advance > 0) {
        backgroundSegments.push({
          end: localStart + advance,
          row,
          run,
          start: localStart,
        });
        markVisible(logicalStart, logicalEnd);
      } else if (visible && width > 0) {
        markVisible(logicalStart, logicalStart + width);
      }

      if (run.underline && advance > 0) {
        underlineSegments.push({
          end: localStart + advance,
          row,
          run,
          start: localStart,
        });
        markVisible(logicalStart, logicalEnd);
      }

      cursor += advance;
    });
  });

  cursor += options.stripPaddingX;

  const cssWidth = Math.max(1, cursor);
  const rowCount = Math.max(1, Math.ceil(cssWidth / rowWidth));

  if (!Number.isFinite(visibleStart) || !Number.isFinite(visibleEnd)) {
    visibleStart = 0;
    visibleEnd = cssWidth;
  }

  return {
    backgroundSegments,
    cssWidth,
    glyphs,
    rowCount,
    rowWidth,
    underlineSegments,
    visibleEnd,
    visibleStart,
  };
}

function measureRun(
  context: CanvasRenderingContext2D,
  run: TickerRun,
  options: TickerOptions,
) {
  context.font = getCanvasFont(options.font, run);
  return measureTrackedText(
    context,
    run.text,
    run.tracking ?? options.letterSpacing,
  );
}

function measureFontMetrics(
  context: CanvasRenderingContext2D,
  font: TickerFont,
  options: TickerOptions,
): FontMetrics {
  const bounds = measureFontBounds(context, font);

  return {
    ascent: bounds.ascent,
    baseline:
      options.stripPaddingY +
      (font.lineHeight - bounds.ascent - bounds.descent) / 2 +
      bounds.ascent,
    descent: bounds.descent,
  };
}

function measureGlyphBounds(
  context: CanvasRenderingContext2D,
  font: TickerFont,
  run: TickerRun,
): GlyphBounds {
  return measureFontBounds(context, font, run);
}

function measureFontBounds(
  context: CanvasRenderingContext2D,
  font: TickerFont,
  run?: TickerRun,
): GlyphBounds {
  context.font = getCanvasFont(font, run);

  const metrics = context.measureText("Hg");

  return {
    ascent:
      metrics.fontBoundingBoxAscent ||
      metrics.actualBoundingBoxAscent ||
      font.size * 0.78,
    descent:
      metrics.fontBoundingBoxDescent ||
      metrics.actualBoundingBoxDescent ||
      font.size * 0.22,
  };
}

function getCanvasFont(font: TickerFont, run?: TickerRun) {
  const style = run?.fontStyle ?? font.style;
  const weight = run?.fontWeight ?? font.weight;

  return `${style} ${weight} ${font.size}px ${quoteFontFamily(font.family)}, ${font.fallback}`;
}

function quoteFontFamily(family: string) {
  return family.includes(" ") ? `"${family}"` : family;
}

function measureTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  tracking: number,
) {
  const glyphs = Array.from(text);

  return glyphs.reduce((width, glyph, index) => {
    const gap = index < glyphs.length - 1 ? tracking : 0;
    return width + context.measureText(glyph).width + gap;
  }, 0);
}

function mergeSegments(segments: LaidOutSegment[]) {
  const sorted = [...segments].sort((a, b) =>
    a.row === b.row ? a.start - b.start : a.row - b.row,
  );
  const merged: LaidOutSegment[] = [];

  sorted.forEach((segment) => {
    const previous = merged.at(-1);

    if (
      previous &&
      previous.run === segment.run &&
      previous.row === segment.row &&
      segment.start <= previous.end + 0.1
    ) {
      previous.end = Math.max(previous.end, segment.end);
      return;
    }

    merged.push({ ...segment });
  });

  return merged;
}

function drawGlyph(
  context: CanvasRenderingContext2D,
  glyph: LaidOutGlyph,
  runSegments: LaidOutSegment[],
  metrics: FontMetrics,
  rowHeight: number,
  options: TickerOptions,
) {
  const segment = findSegmentForGlyph(glyph, runSegments);

  withRunMirrorTransform(context, glyph.run, segment, rowHeight, options, () => {
    context.fillText(
      glyph.glyph,
      glyph.localX,
      glyph.row * rowHeight + metrics.baseline,
    );
  });
}

function findSegmentForGlyph(
  glyph: LaidOutGlyph,
  runSegments: LaidOutSegment[],
) {
  return (
    runSegments.find(
      (segment) =>
        segment.row === glyph.row &&
        glyph.localX >= segment.start - 0.1 &&
        glyph.localX <= segment.end + 0.1,
    ) ?? {
      end: glyph.localX + glyph.advance,
      row: glyph.row,
      run: glyph.run,
      start: glyph.localX,
    }
  );
}

function withRunMirrorTransform(
  context: CanvasRenderingContext2D,
  run: TickerRun,
  segment: LaidOutSegment,
  rowHeight: number,
  options: TickerOptions,
  draw: () => void,
) {
  if (!run.mirrorX && !run.mirrorY) {
    draw();
    return;
  }

  const centerY =
    segment.row * rowHeight +
    options.stripPaddingY +
    options.font.lineHeight / 2 +
    (run.mirrorY ? (run.mirrorOffsetY ?? 0) / 2 : 0);

  context.save();
  context.translate(
    run.mirrorX ? segment.start + segment.end : 0,
    run.mirrorY ? centerY * 2 : 0,
  );
  context.scale(run.mirrorX ? -1 : 1, run.mirrorY ? -1 : 1);
  draw();
  context.restore();
}

function drawBackgroundSegment(
  context: CanvasRenderingContext2D,
  segment: LaidOutSegment,
  baseline: number,
  bounds: GlyphBounds,
  rowHeight: number,
  options: TickerOptions,
  fill: string,
) {
  const y =
    segment.row * rowHeight +
    baseline -
    bounds.ascent -
    options.backgroundPaddingY;

  drawRoundedRect(
    context,
    segment.start - options.backgroundPaddingX,
    y,
    segment.end - segment.start + options.backgroundPaddingX * 2,
    bounds.ascent + bounds.descent + options.backgroundPaddingY * 2,
    options.backgroundRadius,
  );
  context.fillStyle = fill;
  context.fill();
}

function drawUnderlineSegments(
  context: CanvasRenderingContext2D,
  segments: LaidOutSegment[],
  metrics: FontMetrics,
  rowHeight: number,
  options: TickerOptions,
  stroke: string,
  run: TickerRun,
) {
  context.strokeStyle = stroke;
  context.lineWidth = Math.max(2, options.font.size * 0.07);

  segments.forEach((segment) => {
    withRunMirrorTransform(context, run, segment, rowHeight, options, () => {
      const y =
        segment.row * rowHeight + metrics.baseline + options.font.size * 0.14;

      context.beginPath();
      context.moveTo(segment.start, y);
      context.lineTo(segment.end, y);
      context.stroke();
    });
  });
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const corner = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + corner, y);
  context.lineTo(x + width - corner, y);
  context.quadraticCurveTo(x + width, y, x + width, y + corner);
  context.lineTo(x + width, y + height - corner);
  context.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
  context.lineTo(x + corner, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - corner);
  context.lineTo(x, y + corner);
  context.quadraticCurveTo(x, y, x + corner, y);
  context.closePath();
}

/** Load an optional custom font face used by the ticker text. */
export async function loadTickerFont(font: TickerFont) {
  if (font.url) {
    const face = new FontFace(font.family, `url(${font.url})`, {
      style: font.style,
      weight: String(font.weight),
    });

    await face.load();
    document.fonts.add(face);
  }

  await document.fonts.ready;
}
