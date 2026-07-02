import { PartialTickerOptions, TickerOptions } from './types';

export declare const defaultOptions: TickerOptions;
/**
 * Merge partial options over a base set. Nested objects (`font`, `distortion`,
 * `exitOverscan`, `scrollPadding`) are shallow-merged; `runs` is replaced
 * wholesale when provided.
 */
export declare function resolveOptions(base: TickerOptions, overrides?: PartialTickerOptions): TickerOptions;
