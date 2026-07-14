import type {
  EdgeTickerConfig,
  PartialTickerOptions,
  TickerDirection,
  TickerOptions,
} from "./types";
import { defaultOptions, resolveOptions } from "./defaults";
import {
  buildEdgePath,
  buildTickerMesh,
  type PixelRange,
} from "./geometry";
import { loadTickerFont, renderTextStrip, type TextStrip } from "./textStrip";
import { loadDistortionTexture } from "./distortion";
import {
  createWebGLTickerRenderer,
  drawWebGLTicker,
  updateWebGLTickerRenderer,
  type WebGLTickerRenderer,
} from "./glRenderer";
import { clamp, getWebGLContext, requireElement } from "./utils";

type LayoutState = {
  activeTravelDistance: number;
  direction: TickerDirection;
  lapCount: number;
  repeatTexture: boolean;
  scrollPaddingStart: number;
  travelOffset: number;
  travelDistance: number;
};

type WindowVisibleBounds = {
  end: number;
  start: number;
};

type ResolvedOverscan = {
  inside: PixelRange;
  path: PixelRange;
};

/**
 * Scroll-linked WebGL ticker. Create one with {@link createEdgeTicker}, then
 * reconfigure at runtime with {@link EdgeTicker.update} and clean up with
 * {@link EdgeTicker.destroy}.
 */
export class EdgeTicker {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly renderer: WebGLTickerRenderer;

  private options: TickerOptions;
  private layoutState: LayoutState | undefined;
  private distortionTextureSource: TexImageSource | undefined;
  private frameRequested = false;
  private destroyed = false;

  private readonly onResize = () => this.rebuildLayout();
  private readonly onScroll = () => this.requestDraw();

  constructor(canvas: HTMLCanvasElement | string, config: EdgeTickerConfig = {}) {
    this.canvas = requireElement<HTMLCanvasElement>(canvas);
    this.gl = getWebGLContext(this.canvas);
    this.renderer = createWebGLTickerRenderer(this.gl);
    this.options = resolveOptions(defaultOptions, config);

    void this.start();
  }

  /** Current resolved options (read-only snapshot). */
  getOptions(): Readonly<TickerOptions> {
    return this.options;
  }

  /** Merge new options in and rebuild. Use this for responsive font sizing. */
  update(overrides: PartialTickerOptions): void {
    if (this.destroyed) {
      return;
    }

    this.options = resolveOptions(this.options, overrides);
    void this.reload();
  }

  /** Force a layout rebuild against the current options and viewport. */
  refresh(): void {
    this.rebuildLayout();
  }

  /** Remove listeners and stop rendering. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
  }

  private async start() {
    await loadTickerFont(this.options.font);
    this.distortionTextureSource = await loadDistortionTexture(
      this.options.distortion,
    );

    if (this.destroyed) {
      return;
    }

    this.rebuildLayout();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.requestDraw();
  }

  /** Reload async resources (font/texture) then rebuild. */
  private async reload() {
    await loadTickerFont(this.options.font);
    this.distortionTextureSource = await loadDistortionTexture(
      this.options.distortion,
    );

    if (this.destroyed) {
      return;
    }

    this.rebuildLayout();
  }

  private rebuildLayout() {
    if (this.destroyed) {
      return;
    }

    const options = this.options;
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE) as number;
    const strip = renderTextStrip(options, dpr, maxTextureSize);
    const overscan = this.resolveOverscan(options, strip);
    const path = buildEdgePath(cssWidth, cssHeight, options, overscan.path);
    const windowLength = options.repeatTexture
      ? strip.repeatSourceWidth * Math.max(0.01, options.repeatWindowCopies)
      : strip.cssWidth;
    const meshVertices = buildTickerMesh(path, strip, options);
    const visibleBounds = this.getWindowVisibleBounds(
      windowLength,
      strip,
      options.repeatTexture,
    );
    const travelStart =
      options.direction === "reverse"
        ? visibleBounds.start + overscan.inside.start
        : windowLength - visibleBounds.end + overscan.inside.start;
    const travelEnd =
      options.direction === "reverse"
        ? path.length + visibleBounds.end - overscan.inside.end
        : path.length +
          windowLength -
          visibleBounds.start -
          overscan.inside.end;
    const activeTravelDistance = Math.max(1, travelEnd - travelStart);
    const lapCount = Math.max(0, options.scrollLaps);
    const scrollPadding = this.resolveScrollPadding(options, activeTravelDistance);
    const travelDistance = Math.max(
      1,
      activeTravelDistance + scrollPadding.start + scrollPadding.end,
    );

    this.canvas.width = Math.ceil(cssWidth * dpr);
    this.canvas.height = Math.ceil(cssHeight * dpr);
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    updateWebGLTickerRenderer(
      this.renderer,
      strip,
      meshVertices,
      path.length,
      cssWidth,
      cssHeight,
      dpr,
      windowLength,
      options.distortion,
      this.distortionTextureSource,
    );

    this.layoutState = {
      activeTravelDistance,
      direction: options.direction,
      lapCount,
      repeatTexture: options.repeatTexture,
      scrollPaddingStart: scrollPadding.start,
      travelOffset: travelStart,
      travelDistance,
    };

    this.requestDraw();
  }

  private resolveOverscan(
    options: TickerOptions,
    strip: TextStrip,
  ): ResolvedOverscan {
    const end = options.exitOverscan.end * strip.cssWidth;
    const start = options.exitOverscan.start * strip.cssWidth;
    const pathOverscan = {
      end: Math.max(0, end),
      start: Math.max(0, start),
    };

    return {
      inside: {
        end: Math.max(0, -end),
        start: Math.max(0, -start),
      },
      path: this.mapLogicalRangeToPath(options.direction, pathOverscan),
    };
  }

  private mapLogicalRangeToPath(
    direction: TickerDirection,
    range: PixelRange,
  ): PixelRange {
    if (direction === "reverse") {
      return {
        end: range.start,
        start: range.end,
      };
    }

    return range;
  }

  private resolveScrollPadding(
    options: TickerOptions,
    activeTravelDistance: number,
  ): PixelRange {
    return {
      end: options.scrollPadding.end * activeTravelDistance,
      start: options.scrollPadding.start * activeTravelDistance,
    };
  }

  private requestDraw() {
    if (this.frameRequested || this.destroyed) {
      return;
    }

    this.frameRequested = true;
    requestAnimationFrame(() => {
      this.frameRequested = false;
      this.drawTicker();
    });
  }

  private drawTicker() {
    if (!this.layoutState || this.destroyed) {
      return;
    }

    const {
      activeTravelDistance,
      direction,
      lapCount,
      repeatTexture,
      scrollPaddingStart,
      travelDistance,
      travelOffset,
    } = this.layoutState;
    const maxScroll = Math.max(1, this.getMaxScrollDistance());
    const progress = clamp(window.scrollY / maxScroll, 0, 1);
    const rawTravel = progress * travelDistance;
    const passProgress = clamp(
      (rawTravel - scrollPaddingStart) / activeTravelDistance,
      0,
      1,
    );
    const totalTravel = passProgress * activeTravelDistance * lapCount;
    const travel = this.getLoopedTravel(totalTravel, activeTravelDistance);

    drawWebGLTicker(
      this.renderer,
      travel + travelOffset,
      direction,
      repeatTexture,
    );
  }

  private getLoopedTravel(totalTravel: number, passDistance: number) {
    if (totalTravel <= 0) {
      return 0;
    }

    const wrappedTravel = totalTravel % passDistance;

    return wrappedTravel < 0.0001 ? passDistance : wrappedTravel;
  }

  private getWindowVisibleBounds(
    windowLength: number,
    strip: TextStrip,
    repeatTexture: boolean,
  ): WindowVisibleBounds {
    const repeatSourceStart = repeatTexture ? strip.repeatSourceStart : 0;
    const repeatPeriod = repeatTexture ? strip.repeatSourceWidth : strip.cssWidth;
    const repeatedVisibleStart = clamp(
      strip.visibleStart - repeatSourceStart,
      0,
      repeatPeriod,
    );
    const repeatedVisibleEnd = clamp(
      strip.visibleEnd - repeatSourceStart,
      0,
      repeatPeriod,
    );
    const start = Math.min(repeatedVisibleStart, windowLength);
    let end = start;

    for (
      let repeatStart = 0;
      repeatStart < windowLength;
      repeatStart += repeatPeriod
    ) {
      const visibleStart = repeatStart + repeatedVisibleStart;
      const visibleEnd = Math.min(
        repeatStart + repeatedVisibleEnd,
        windowLength,
      );

      if (visibleStart <= windowLength && visibleEnd > visibleStart) {
        end = Math.max(end, visibleEnd);
      }
    }

    return { end, start };
  }

  private getMaxScrollDistance() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  }
}

/** Create and start an {@link EdgeTicker} bound to a canvas element or selector. */
export function createEdgeTicker(
  canvas: HTMLCanvasElement | string,
  config: EdgeTickerConfig = {},
): EdgeTicker {
  return new EdgeTicker(canvas, config);
}
