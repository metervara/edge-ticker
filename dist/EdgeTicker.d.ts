import { EdgeTickerConfig, PartialTickerOptions, TickerOptions } from './types';

/**
 * Scroll-linked WebGL ticker. Create one with {@link createEdgeTicker}, then
 * reconfigure at runtime with {@link EdgeTicker.update} and clean up with
 * {@link EdgeTicker.destroy}.
 */
export declare class EdgeTicker {
    private readonly canvas;
    private readonly gl;
    private readonly renderer;
    private options;
    private layoutState;
    private distortionTextureSource;
    private frameRequested;
    private destroyed;
    private readonly onResize;
    private readonly onScroll;
    constructor(canvas: HTMLCanvasElement | string, config?: EdgeTickerConfig);
    /** Current resolved options (read-only snapshot). */
    getOptions(): Readonly<TickerOptions>;
    /** Merge new options in and rebuild. Use this for responsive font sizing. */
    update(overrides: PartialTickerOptions): void;
    /** Force a layout rebuild against the current options and viewport. */
    refresh(): void;
    /** Remove listeners and stop rendering. */
    destroy(): void;
    private start;
    /** Reload async resources (font/texture) then rebuild. */
    private reload;
    private rebuildLayout;
    private resolveOverscan;
    private mapLogicalRangeToPath;
    private resolveScrollPadding;
    private requestDraw;
    private drawTicker;
    private getLoopedTravel;
    private getWindowVisibleBounds;
    private getMaxScrollDistance;
}
/** Create and start an {@link EdgeTicker} bound to a canvas element or selector. */
export declare function createEdgeTicker(canvas: HTMLCanvasElement | string, config?: EdgeTickerConfig): EdgeTicker;
