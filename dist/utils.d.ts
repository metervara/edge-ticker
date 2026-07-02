export declare function clamp(value: number, min: number, max: number): number;
export declare function requireElement<T extends Element>(target: T | string): T;
export declare function get2dContext(canvasElement: HTMLCanvasElement): CanvasRenderingContext2D;
export declare function getWebGLContext(canvasElement: HTMLCanvasElement): WebGL2RenderingContext;
export declare function createShader(glContext: WebGL2RenderingContext, type: number, source: string): WebGLShader;
export declare function createProgram(glContext: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
export declare function requireUniform(glContext: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation;
export declare function requireAttribute(glContext: WebGL2RenderingContext, program: WebGLProgram, name: string): number;
export declare function requireWebGLObject<T>(object: T | null, label: string): NonNullable<T>;
