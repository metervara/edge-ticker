export type FontStyle = "normal" | "italic" | "oblique";

/** "reverse" starts horizontally on the top edge; "forward" starts on the right edge. */
export type TickerDirection = "forward" | "reverse";

/** A styled span of ticker text. Runs are concatenated in order. */
export type TickerRun = {
  text: string;
  /** Rounded background pill behind the run. */
  background?: string;
  /** Text fill color (defaults to #111111). */
  fill?: string;
  fontStyle?: FontStyle;
  fontWeight?: string | number;
  /** Punch the glyphs out of the background instead of painting them. */
  punchOut?: boolean;
  /** Per-run letter spacing override (defaults to `letterSpacing`). */
  tracking?: number;
  underline?: boolean;
};

export type TickerFont = {
  family: string;
  fallback: string;
  lineHeight: number;
  /**
   * Font size in CSS pixels. This is the only sizing knob the library exposes —
   * fluid / responsive sizing is the consuming project's concern. Recompute it
   * yourself (matchMedia, ResizeObserver, clamp math, …) and push a new value in
   * with `EdgeTicker.update({ font: { size } })`.
   */
  size: number;
  style: FontStyle;
  /** Optional WOFF/WOFF2 URL loaded via the FontFace API. */
  url?: string;
  weight: string | number;
};

export type DistortionOptions = {
  /** Master switch. Distortion only renders when this is true AND `textureUrl` resolves. */
  enabled: boolean;
  repeatX: number;
  repeatY: number;
  /** false anchors distortion to edge locations; true makes the pattern travel with the text. */
  scrollWithText: boolean;
  /** Green-channel offset in ticker-text pixels (across the strip). */
  strengthAcross: number;
  /** Red-channel offset in ticker-text pixels (along the strip). */
  strengthAlong: number;
  /** RG distortion map. Red offsets glyphs along the ticker, green offsets across it. */
  textureUrl?: string;
};

/** A range normalized to some length. `start`/`end` are relative to scroll direction. */
export type NormalizedRange = {
  end: number;
  start: number;
};

export type EdgePadding =
  | number
  | {
      bottom?: number;
      left?: number;
      right?: number;
      top?: number;
      /** Horizontal fallback for left/right. */
      x?: number;
      /** Vertical fallback for top/bottom. */
      y?: number;
    };

export type TickerOptions = {
  // Text rendering
  backgroundPaddingX: number;
  backgroundRadius: number;
  font: TickerFont;
  letterSpacing: number;
  stripPaddingX: number;
  stripPaddingY: number;

  // Path placement
  cornerRadius: number;
  direction: TickerDirection;
  edgePadding: EdgePadding;
  /**
   * Normalized to the rendered strip length. 1 = one full strip; negative pulls
   * the path inside. start/end are relative to ticker scroll direction.
   */
  exitOverscan: NormalizedRange;

  // Repeat and scroll
  /** Repeats the text texture inside the visible moving window. */
  repeatTexture: boolean;
  /** How many times the ticker text repeats inside the window. */
  repeatWindowCopies: number;
  /** Number of complete visible ticker passes over the full page scroll. */
  scrollLaps: number;
  /** Normalized to one complete ticker pass. 1 = one pass of dead scroll. */
  scrollPadding: NormalizedRange;

  // Mesh slicing
  columnStep: number;
  rowStep: number;

  // Distortion texture
  distortion: DistortionOptions;

  // Content
  runs: TickerRun[];
};

/** A deeply-optional view of `TickerOptions` for `createEdgeTicker` / `update`. */
export type PartialTickerOptions = {
  [K in keyof TickerOptions]?: TickerOptions[K] extends object
    ? TickerOptions[K] extends unknown[]
      ? TickerOptions[K]
      : Partial<TickerOptions[K]>
    : TickerOptions[K];
};

/**
 * Configuration accepted by `createEdgeTicker`. The ticker maps the document's
 * existing scroll range onto the full ticker travel — it does not add any
 * scroll spacer, so the effect completes exactly at the bottom of your content.
 */
export type EdgeTickerConfig = PartialTickerOptions;
