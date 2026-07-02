import type { DistortionOptions } from "./types";

/**
 * Load the RG distortion texture, if a URL is configured. Distortion is entirely
 * texture-driven: red offsets glyphs along the ticker, green offsets across it.
 * Without a `textureUrl` there is no distortion — pass your own map to enable it.
 */
export async function loadDistortionTexture(distortion: DistortionOptions) {
  if (!distortion.textureUrl) {
    return undefined;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  image.src = distortion.textureUrl;
  await image.decode();

  return image;
}
