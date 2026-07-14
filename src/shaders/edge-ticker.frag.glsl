#version 300 es
precision highp float;

in vec2 vDistortionUv;
in vec2 vUv;
in float vWindowX;

uniform float uDistortionEnabled;
uniform float uRepeatSourceStart;
uniform float uRepeatSourceWidth;
uniform float uRepeatTexture;
uniform float uTextureRows;
uniform float uTextureRowWidth;
uniform float uWindowLength;
uniform sampler2D uDistortionTexture;
uniform vec2 uDistortionStrength;
uniform float uStripWidth;
uniform sampler2D uTexture;

out vec4 outColor;

void main() {
  if (vWindowX < 0.0 || vWindowX > uWindowLength) {
    discard;
  }

  vec2 uv = vUv;

  if (uDistortionEnabled > 0.5) {
    vec2 offset = texture(uDistortionTexture, vDistortionUv).rg * 2.0 - 1.0;
    uv += offset * uDistortionStrength;
  }

  float sourceX = uv.x * uStripWidth;

  if (uRepeatTexture > 0.5) {
    sourceX = uRepeatSourceStart + mod(
      mod(sourceX, uRepeatSourceWidth) + uRepeatSourceWidth,
      uRepeatSourceWidth
    );
  } else if (sourceX < 0.0 || sourceX > uStripWidth) {
    discard;
  }

  if (uv.y < 0.0 || uv.y > 1.0) {
    discard;
  }

  float row = floor(sourceX / uTextureRowWidth);

  if (row < 0.0 || row >= uTextureRows) {
    discard;
  }

  float localX = sourceX - row * uTextureRowWidth;
  vec2 atlasUv = vec2(
    localX / uTextureRowWidth,
    (row + uv.y) / uTextureRows
  );

  outColor = texture(uTexture, atlasUv);
}
