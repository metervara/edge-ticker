#version 300 es
precision highp float;

in vec2 vDistortionUv;
in vec2 vUv;
in float vWindowX;

uniform float uDistortionEnabled;
uniform float uRepeatTexture;
uniform float uWindowLength;
uniform sampler2D uDistortionTexture;
uniform vec2 uDistortionStrength;
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

  if (uRepeatTexture < 0.5 && (uv.x < 0.0 || uv.x > 1.0)) {
    discard;
  }

  if (uv.y < 0.0 || uv.y > 1.0) {
    discard;
  }

  outColor = texture(uTexture, uv);
}
