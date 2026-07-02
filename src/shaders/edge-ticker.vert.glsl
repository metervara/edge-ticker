#version 300 es
precision highp float;

in vec2 aPosition;
in float aPathDistance;
in float aTexY;

uniform vec2 uResolution;
uniform vec2 uDistortionRepeat;
uniform float uDistortionScrollMode;
uniform float uPathLength;
uniform float uSourceBias;
uniform float uStripWidth;
uniform float uTravel;
uniform float uTravelFactor;

out vec2 vDistortionUv;
out vec2 vUv;
out float vWindowX;

void main() {
  vec2 zeroToOne = aPosition / uResolution;
  vec2 clip = zeroToOne * 2.0 - 1.0;
  float windowX = aPathDistance + uTravelFactor * uTravel + uSourceBias;
  float pathUvX = aPathDistance / uPathLength;
  float textUvX = windowX / uStripWidth;

  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vUv = vec2(textUvX, aTexY);
  vWindowX = windowX;
  vDistortionUv = vec2(
    mix(pathUvX, textUvX, uDistortionScrollMode) * uDistortionRepeat.x,
    aTexY * uDistortionRepeat.y
  );
}
