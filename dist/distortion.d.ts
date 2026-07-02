import { DistortionOptions } from './types';

/**
 * Load the RG distortion texture, if a URL is configured. Distortion is entirely
 * texture-driven: red offsets glyphs along the ticker, green offsets across it.
 * Without a `textureUrl` there is no distortion — pass your own map to enable it.
 */
export declare function loadDistortionTexture(distortion: DistortionOptions): Promise<HTMLImageElement | undefined>;
