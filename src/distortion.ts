import type { DistortionOptions } from "./types";
import { clamp } from "./utils";

/** Load the optional RG distortion texture, if a URL is configured. */
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

/** Procedural fallback RG distortion map used when no texture URL is provided. */
export function createDistortionMap(size: number) {
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    const v = y / size;

    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = (y * size + x) * 4;
      const along =
        0.52 * Math.sin(Math.PI * 2 * (2 * u + 1 * v)) +
        0.28 * Math.sin(Math.PI * 2 * (5 * u - 2 * v)) +
        0.2 * Math.cos(Math.PI * 2 * (1 * u + 3 * v));
      const across =
        0.45 * Math.cos(Math.PI * 2 * (1 * u - 2 * v)) +
        0.35 * Math.sin(Math.PI * 2 * (3 * u + 1 * v)) +
        0.2 * Math.cos(Math.PI * 2 * (4 * v));

      pixels[index] = normalizedByte(along);
      pixels[index + 1] = normalizedByte(across);
      pixels[index + 2] = 128;
      pixels[index + 3] = 255;
    }
  }

  return pixels;
}

function normalizedByte(value: number) {
  return Math.round(clamp(value * 0.5 + 0.5, 0, 1) * 255);
}
