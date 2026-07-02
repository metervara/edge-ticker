import fragmentShaderSource from "./shaders/edge-ticker.frag.glsl";
import vertexShaderSource from "./shaders/edge-ticker.vert.glsl";
import type { DistortionOptions, TickerDirection } from "./types";
import type { TextStrip } from "./textStrip";
import {
  createProgram,
  createShader,
  requireAttribute,
  requireUniform,
  requireWebGLObject,
} from "./utils";

export type WebGLTickerRenderer = {
  attributes: {
    pathDistance: number;
    position: number;
    texY: number;
  };
  buffer: WebGLBuffer;
  gl: WebGL2RenderingContext;
  distortionTexture: WebGLTexture;
  pathLength: number;
  program: WebGLProgram;
  stripWidth: number;
  texture: WebGLTexture;
  uniforms: {
    distortionEnabled: WebGLUniformLocation;
    distortionRepeat: WebGLUniformLocation;
    distortionSampler: WebGLUniformLocation;
    distortionScrollMode: WebGLUniformLocation;
    distortionStrength: WebGLUniformLocation;
    pathLength: WebGLUniformLocation;
    repeatTexture: WebGLUniformLocation;
    resolution: WebGLUniformLocation;
    sourceBias: WebGLUniformLocation;
    stripWidth: WebGLUniformLocation;
    texture: WebGLUniformLocation;
    travel: WebGLUniformLocation;
    travelFactor: WebGLUniformLocation;
    windowLength: WebGLUniformLocation;
  };
  vertexCount: number;
  windowLength: number;
};

export function createWebGLTickerRenderer(
  glContext: WebGL2RenderingContext,
): WebGLTickerRenderer {
  const vertexShader = createShader(
    glContext,
    glContext.VERTEX_SHADER,
    vertexShaderSource,
  );
  const fragmentShader = createShader(
    glContext,
    glContext.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  const program = createProgram(glContext, vertexShader, fragmentShader);
  const buffer = requireWebGLObject(glContext.createBuffer(), "buffer");
  const texture = requireWebGLObject(glContext.createTexture(), "texture");
  const distortionTexture = requireWebGLObject(
    glContext.createTexture(),
    "distortion texture",
  );

  glContext.useProgram(program);
  glContext.enable(glContext.BLEND);
  glContext.disable(glContext.DEPTH_TEST);
  glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);
  glContext.bindTexture(glContext.TEXTURE_2D, texture);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.REPEAT);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR);
  glContext.bindTexture(glContext.TEXTURE_2D, distortionTexture);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.REPEAT);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.REPEAT);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
  glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR);

  return {
    attributes: {
      pathDistance: requireAttribute(glContext, program, "aPathDistance"),
      position: requireAttribute(glContext, program, "aPosition"),
      texY: requireAttribute(glContext, program, "aTexY"),
    },
    buffer,
    distortionTexture,
    gl: glContext,
    pathLength: 0,
    program,
    stripWidth: 1,
    texture,
    uniforms: {
      distortionEnabled: requireUniform(glContext, program, "uDistortionEnabled"),
      distortionRepeat: requireUniform(glContext, program, "uDistortionRepeat"),
      distortionSampler: requireUniform(glContext, program, "uDistortionTexture"),
      distortionScrollMode: requireUniform(glContext, program, "uDistortionScrollMode"),
      distortionStrength: requireUniform(glContext, program, "uDistortionStrength"),
      pathLength: requireUniform(glContext, program, "uPathLength"),
      repeatTexture: requireUniform(glContext, program, "uRepeatTexture"),
      resolution: requireUniform(glContext, program, "uResolution"),
      sourceBias: requireUniform(glContext, program, "uSourceBias"),
      stripWidth: requireUniform(glContext, program, "uStripWidth"),
      texture: requireUniform(glContext, program, "uTexture"),
      travel: requireUniform(glContext, program, "uTravel"),
      travelFactor: requireUniform(glContext, program, "uTravelFactor"),
      windowLength: requireUniform(glContext, program, "uWindowLength"),
    },
    vertexCount: 0,
    windowLength: 1,
  };
}

export function updateWebGLTickerRenderer(
  target: WebGLTickerRenderer,
  strip: TextStrip,
  meshVertices: Float32Array,
  pathLength: number,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  windowLength: number,
  distortion: DistortionOptions,
  distortionSource?: TexImageSource,
) {
  const { gl: glContext } = target;
  const hasDistortion = distortion.enabled && Boolean(distortionSource);

  target.pathLength = pathLength;
  target.stripWidth = strip.cssWidth;
  target.vertexCount = meshVertices.length / 4;
  target.windowLength = windowLength;

  glContext.viewport(0, 0, Math.ceil(cssWidth * dpr), Math.ceil(cssHeight * dpr));
  glContext.useProgram(target.program);
  glContext.uniform2f(target.uniforms.resolution, cssWidth, cssHeight);
  glContext.uniform1f(target.uniforms.pathLength, pathLength);
  glContext.uniform1f(target.uniforms.stripWidth, strip.cssWidth);
  glContext.uniform1f(target.uniforms.windowLength, windowLength);
  glContext.uniform1i(target.uniforms.texture, 0);
  glContext.uniform1i(target.uniforms.distortionSampler, 1);
  glContext.uniform1f(target.uniforms.distortionEnabled, hasDistortion ? 1 : 0);
  glContext.uniform2f(
    target.uniforms.distortionRepeat,
    Math.max(0.001, distortion.repeatX),
    Math.max(0.001, distortion.repeatY),
  );
  glContext.uniform1f(
    target.uniforms.distortionScrollMode,
    distortion.scrollWithText ? 1 : 0,
  );
  glContext.uniform2f(
    target.uniforms.distortionStrength,
    distortion.strengthAlong / strip.cssWidth,
    distortion.strengthAcross / strip.cssHeight,
  );

  glContext.bindBuffer(glContext.ARRAY_BUFFER, target.buffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, meshVertices, glContext.STATIC_DRAW);
  bindWebGLTickerAttributes(target);

  glContext.activeTexture(glContext.TEXTURE0);
  glContext.bindTexture(glContext.TEXTURE_2D, target.texture);
  glContext.pixelStorei(glContext.UNPACK_FLIP_Y_WEBGL, false);
  glContext.texImage2D(
    glContext.TEXTURE_2D,
    0,
    glContext.RGBA,
    glContext.RGBA,
    glContext.UNSIGNED_BYTE,
    strip.canvas,
  );
  glContext.activeTexture(glContext.TEXTURE1);
  glContext.bindTexture(glContext.TEXTURE_2D, target.distortionTexture);

  if (distortionSource) {
    glContext.texImage2D(
      glContext.TEXTURE_2D,
      0,
      glContext.RGBA,
      glContext.RGBA,
      glContext.UNSIGNED_BYTE,
      distortionSource,
    );
  } else {
    // No texture supplied: upload a neutral 1x1 pixel so the sampler stays
    // complete. Distortion is disabled via the uniform above, so it is unused.
    glContext.texImage2D(
      glContext.TEXTURE_2D,
      0,
      glContext.RGBA,
      1,
      1,
      0,
      glContext.RGBA,
      glContext.UNSIGNED_BYTE,
      new Uint8Array([128, 128, 128, 255]),
    );
  }
}

export function drawWebGLTicker(
  target: WebGLTickerRenderer,
  travel: number,
  direction: TickerDirection,
  repeatTexture: boolean,
) {
  const { gl: glContext } = target;
  const isReversed = direction === "reverse";

  glContext.clearColor(0, 0, 0, 0);
  glContext.clear(glContext.COLOR_BUFFER_BIT);
  glContext.useProgram(target.program);
  glContext.uniform1f(target.uniforms.travel, travel);
  glContext.uniform1f(target.uniforms.travelFactor, isReversed ? 1 : -1);
  glContext.uniform1f(target.uniforms.repeatTexture, repeatTexture ? 1 : 0);
  glContext.uniform1f(
    target.uniforms.sourceBias,
    isReversed ? -target.pathLength : target.windowLength,
  );
  glContext.activeTexture(glContext.TEXTURE0);
  glContext.bindTexture(glContext.TEXTURE_2D, target.texture);
  glContext.activeTexture(glContext.TEXTURE1);
  glContext.bindTexture(glContext.TEXTURE_2D, target.distortionTexture);
  glContext.bindBuffer(glContext.ARRAY_BUFFER, target.buffer);
  bindWebGLTickerAttributes(target);
  glContext.drawArrays(glContext.TRIANGLES, 0, target.vertexCount);
}

function bindWebGLTickerAttributes(target: WebGLTickerRenderer) {
  const { gl: glContext } = target;
  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

  glContext.enableVertexAttribArray(target.attributes.position);
  glContext.vertexAttribPointer(
    target.attributes.position,
    2,
    glContext.FLOAT,
    false,
    stride,
    0,
  );
  glContext.enableVertexAttribArray(target.attributes.pathDistance);
  glContext.vertexAttribPointer(
    target.attributes.pathDistance,
    1,
    glContext.FLOAT,
    false,
    stride,
    2 * Float32Array.BYTES_PER_ELEMENT,
  );
  glContext.enableVertexAttribArray(target.attributes.texY);
  glContext.vertexAttribPointer(
    target.attributes.texY,
    1,
    glContext.FLOAT,
    false,
    stride,
    3 * Float32Array.BYTES_PER_ELEMENT,
  );
}
