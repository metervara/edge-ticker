import type { TickerFont, TickerOptions, TickerRun } from "./types";
import { get2dContext } from "./utils";

export type TextStrip = {
  canvas: HTMLCanvasElement;
  cssHeight: number;
  cssWidth: number;
  midline: number;
  scale: number;
  visibleEnd: number;
  visibleStart: number;
};

export function renderTextStrip(options: TickerOptions, dpr: number): TextStrip {
  const scale = Math.min(dpr, 2);
  const measureCanvas = document.createElement("canvas");
  const measureContext = get2dContext(measureCanvas);
  const runWidths = options.runs.map((run) =>
    measureRun(measureContext, run, options),
  );
  const cssWidth = Math.ceil(
    runWidths.reduce((total, width) => total + width, 0) +
      options.stripPaddingX * 2,
  );
  const cssHeight = Math.ceil(options.font.lineHeight + options.stripPaddingY * 2);
  const stripCanvas = document.createElement("canvas");
  const stripContext = get2dContext(stripCanvas);

  stripCanvas.width = Math.ceil(cssWidth * scale);
  stripCanvas.height = Math.ceil(cssHeight * scale);
  stripContext.scale(scale, scale);
  stripContext.textBaseline = "alphabetic";
  stripContext.imageSmoothingEnabled = true;
  stripContext.imageSmoothingQuality = "high";
  measureContext.font = getCanvasFont(options.font);

  const metrics = measureContext.measureText("Hg");
  const ascent = metrics.actualBoundingBoxAscent || options.font.size * 0.78;
  const descent = metrics.actualBoundingBoxDescent || options.font.size * 0.22;
  const baseline =
    options.stripPaddingY +
    (options.font.lineHeight - ascent - descent) / 2 +
    ascent;
  let cursor = options.stripPaddingX;

  options.runs.forEach((run, index) => {
    const width = runWidths[index] ?? 0;

    if (run.background) {
      drawRoundedRect(
        stripContext,
        cursor - options.backgroundPaddingX,
        options.stripPaddingY - 6,
        width + options.backgroundPaddingX * 2,
        options.font.lineHeight + 12,
        options.backgroundRadius,
      );
      stripContext.fillStyle = run.background;
      stripContext.fill();
    }

    stripContext.font = getCanvasFont(options.font, run);
    stripContext.fillStyle = run.fill || "#111111";
    stripContext.globalCompositeOperation = run.punchOut
      ? "destination-out"
      : "source-over";
    drawTrackedText(
      stripContext,
      run.text,
      cursor,
      baseline,
      run.tracking ?? options.letterSpacing,
    );

    if (run.underline) {
      stripContext.strokeStyle = run.fill || "#111111";
      stripContext.lineWidth = Math.max(2, options.font.size * 0.07);
      stripContext.beginPath();
      stripContext.moveTo(cursor, baseline + options.font.size * 0.14);
      stripContext.lineTo(cursor + width, baseline + options.font.size * 0.14);
      stripContext.stroke();
    }

    stripContext.globalCompositeOperation = "source-over";
    cursor += width;
  });

  const visibleBounds = getAlphaXBounds(stripCanvas, scale);

  return {
    canvas: stripCanvas,
    cssHeight,
    cssWidth,
    midline: cssHeight / 2,
    scale,
    visibleEnd: visibleBounds.end,
    visibleStart: visibleBounds.start,
  };
}

function getAlphaXBounds(canvasElement: HTMLCanvasElement, scale: number) {
  const context = get2dContext(canvasElement);
  const imageData = context.getImageData(
    0,
    0,
    canvasElement.width,
    canvasElement.height,
  );
  const { data, height, width } = imageData;
  let left = width;
  let right = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 0) {
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
  }

  if (right < left) {
    return { end: canvasElement.width / scale, start: 0 };
  }

  return {
    end: (right + 1) / scale,
    start: left / scale,
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

function drawTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  let cursor = x;

  Array.from(text).forEach((glyph, index, glyphs) => {
    context.fillText(glyph, cursor, y);
    cursor += context.measureText(glyph).width;

    if (index < glyphs.length - 1) {
      cursor += tracking;
    }
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
