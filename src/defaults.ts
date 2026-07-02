import type { PartialTickerOptions, TickerOptions } from "./types";

export const defaultOptions: TickerOptions = {
  // Text rendering
  backgroundPaddingX: 12,
  backgroundRadius: 7,
  font: {
    family: "EdgeTickerSans",
    fallback: "Inter, ui-sans-serif, system-ui, sans-serif",
    lineHeight: 66,
    size: 48,
    style: "normal",
    weight: 700,
    // Drop a font file somewhere servable and set this, for example:
    // url: "/fonts/YourFont.woff2",
  },
  letterSpacing: 1.5,
  stripPaddingX: 28,
  stripPaddingY: 18,

  // Path placement
  cornerRadius: 86,
  direction: "reverse",
  edgePadding: 24,
  exitOverscan: {
    start: 0,
    end: -0.5,
  },

  // Repeat and scroll
  repeatTexture: true,
  repeatWindowCopies: 2,
  scrollLaps: 1,
  scrollPadding: {
    start: 0,
    end: 0,
  },

  // Mesh slicing
  columnStep: 2,
  rowStep: 3,

  // Distortion texture. Supply `textureUrl` (an RG map) to enable distortion;
  // with no texture the effect is inert. Red offsets glyphs along the ticker,
  // green offsets across it.
  distortion: {
    enabled: true,
    repeatX: 8,
    repeatY: 1,
    scrollWithText: false,
    strengthAlong: 8,
    strengthAcross: 10,
    // textureUrl: "/textures/distortion-rg.png",
  },

  // Content
  runs: [
    {
      text: " START ",
      background: "#111111",
      fontWeight: 900,
      punchOut: true,
    },
    {
      text: "     This is the text that ends here.    ",
      fill: "#111111",
      fontWeight: 700,
    },
    {
      text: " END ",
      background: "#ff6b57",
      fontWeight: 900,
      punchOut: true,
    },
  ],
};

/**
 * Merge partial options over a base set. Nested objects (`font`, `distortion`,
 * `exitOverscan`, `scrollPadding`) are shallow-merged; `runs` is replaced
 * wholesale when provided.
 */
export function resolveOptions(
  base: TickerOptions,
  overrides: PartialTickerOptions = {},
): TickerOptions {
  return {
    ...base,
    ...overrides,
    font: { ...base.font, ...overrides.font },
    exitOverscan: { ...base.exitOverscan, ...overrides.exitOverscan },
    scrollPadding: { ...base.scrollPadding, ...overrides.scrollPadding },
    distortion: { ...base.distortion, ...overrides.distortion },
    runs: overrides.runs ?? base.runs,
  };
}
