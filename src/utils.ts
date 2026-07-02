export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function requireElement<T extends Element>(
  target: T | string,
): T {
  if (typeof target !== "string") {
    return target;
  }

  const element = document.querySelector<T>(target);

  if (!element) {
    throw new Error(`Missing required element: ${target}`);
  }

  return element;
}

export function get2dContext(canvasElement: HTMLCanvasElement) {
  const renderingContext = canvasElement.getContext("2d");

  if (!renderingContext) {
    throw new Error("Could not create 2D canvas context");
  }

  return renderingContext;
}

export function getWebGLContext(canvasElement: HTMLCanvasElement) {
  const renderingContext = canvasElement.getContext("webgl2", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
  });

  if (!renderingContext) {
    throw new Error("Could not create WebGL2 context");
  }

  return renderingContext;
}

export function createShader(
  glContext: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = requireWebGLObject(glContext.createShader(type), "shader");

  glContext.shaderSource(shader, source);
  glContext.compileShader(shader);

  if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
    const log = glContext.getShaderInfoLog(shader) || "Unknown shader error";
    glContext.deleteShader(shader);
    throw new Error(log);
  }

  return shader;
}

export function createProgram(
  glContext: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = requireWebGLObject(glContext.createProgram(), "program");

  glContext.attachShader(program, vertexShader);
  glContext.attachShader(program, fragmentShader);
  glContext.linkProgram(program);

  if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
    const log =
      glContext.getProgramInfoLog(program) || "Unknown program link error";
    glContext.deleteProgram(program);
    throw new Error(log);
  }

  glContext.deleteShader(vertexShader);
  glContext.deleteShader(fragmentShader);

  return program;
}

export function requireUniform(
  glContext: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
) {
  const location = glContext.getUniformLocation(program, name);

  if (!location) {
    throw new Error(`Missing WebGL uniform: ${name}`);
  }

  return location;
}

export function requireAttribute(
  glContext: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
) {
  const location = glContext.getAttribLocation(program, name);

  if (location < 0) {
    throw new Error(`Missing WebGL attribute: ${name}`);
  }

  return location;
}

export function requireWebGLObject<T>(object: T | null, label: string) {
  if (!object) {
    throw new Error(`Could not create WebGL ${label}`);
  }

  return object;
}
