import { DistortionOptions, TickerDirection } from './types';
import { TextStrip } from './textStrip';

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
        repeatSourceStart: WebGLUniformLocation;
        repeatSourceWidth: WebGLUniformLocation;
        repeatTexture: WebGLUniformLocation;
        resolution: WebGLUniformLocation;
        sourceBias: WebGLUniformLocation;
        stripWidth: WebGLUniformLocation;
        textureRows: WebGLUniformLocation;
        textureRowWidth: WebGLUniformLocation;
        texture: WebGLUniformLocation;
        travel: WebGLUniformLocation;
        travelFactor: WebGLUniformLocation;
        windowLength: WebGLUniformLocation;
    };
    vertexCount: number;
    windowLength: number;
};
export declare function createWebGLTickerRenderer(glContext: WebGL2RenderingContext): WebGLTickerRenderer;
export declare function updateWebGLTickerRenderer(target: WebGLTickerRenderer, strip: TextStrip, meshVertices: Float32Array, pathLength: number, cssWidth: number, cssHeight: number, dpr: number, windowLength: number, distortion: DistortionOptions, distortionSource?: TexImageSource): void;
export declare function drawWebGLTicker(target: WebGLTickerRenderer, travel: number, direction: TickerDirection, repeatTexture: boolean): void;
