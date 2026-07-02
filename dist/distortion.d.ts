import { DistortionOptions } from './types';

/** Load the optional RG distortion texture, if a URL is configured. */
export declare function loadDistortionTexture(distortion: DistortionOptions): Promise<HTMLImageElement | undefined>;
/** Procedural fallback RG distortion map used when no texture URL is provided. */
export declare function createDistortionMap(size: number): Uint8Array<ArrayBuffer>;
