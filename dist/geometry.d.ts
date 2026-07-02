import { TickerOptions } from './types';
import { TextStrip } from './textStrip';

export type LineSegment = {
    kind: "line";
    length: number;
    nx: number;
    ny: number;
    tx: number;
    ty: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
};
export type ArcSegment = {
    kind: "arc";
    centerX: number;
    centerY: number;
    direction: number;
    endAngle: number;
    length: number;
    radius: number;
    startAngle: number;
};
export type PathSegment = LineSegment | ArcSegment;
export type EdgePath = {
    length: number;
    segments: PathSegment[];
};
export type PathSample = {
    curveRadius?: number;
    nx: number;
    ny: number;
    tx: number;
    ty: number;
    x: number;
    y: number;
};
export type MeshColumn = {
    pathDistance: number;
    sample: PathSample;
};
export type PixelRange = {
    end: number;
    start: number;
};
export declare function buildEdgePath(width: number, height: number, options: TickerOptions, exitOverscan: PixelRange): EdgePath;
export declare function buildTickerMesh(path: EdgePath, strip: TextStrip, options: TickerOptions): Float32Array<ArrayBuffer>;
