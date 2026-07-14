import { TickerFont, TickerOptions } from './types';

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
export declare function renderTextStrip(options: TickerOptions, dpr: number, maxTextureSize?: number): TextStrip;
/** Load an optional custom font face used by the ticker text. */
export declare function loadTickerFont(font: TickerFont): Promise<void>;
