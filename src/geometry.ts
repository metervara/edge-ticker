import type { EdgePadding, TickerOptions } from "./types";
import type { TextStrip } from "./textStrip";
import { clamp } from "./utils";

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

type ResolvedEdgePadding = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export function buildEdgePath(
  width: number,
  height: number,
  options: TickerOptions,
  exitOverscan: PixelRange,
): EdgePath {
  const textBand = options.font.lineHeight + options.stripPaddingY * 2;
  const edgePadding = resolveEdgePadding(options.edgePadding);
  const halfTextBand = textBand / 2;
  const left = edgePadding.left + halfTextBand;
  const top = edgePadding.top + halfTextBand;
  const right = width - edgePadding.right - halfTextBand;
  const bottom = height - edgePadding.bottom - halfTextBand;
  const radius = clamp(
    options.cornerRadius,
    12,
    Math.max(12, Math.min((right - left) / 2, (bottom - top) / 2) - 1),
  );
  const segments: PathSegment[] = [
    makeLine(right, -exitOverscan.start, right, bottom - radius),
    makeArc(right - radius, bottom - radius, radius, 0, Math.PI / 2),
    makeLine(right - radius, bottom, left + radius, bottom),
    makeArc(left + radius, bottom - radius, radius, Math.PI / 2, Math.PI),
    makeLine(left, bottom - radius, left, top + radius),
    makeArc(left + radius, top + radius, radius, Math.PI, Math.PI * 1.5),
    makeLine(left + radius, top, width + exitOverscan.end, top),
  ];

  return {
    length: segments.reduce((total, segment) => total + segment.length, 0),
    segments,
  };
}

function resolveEdgePadding(edgePadding: EdgePadding): ResolvedEdgePadding {
  if (typeof edgePadding === "number") {
    return {
      top: edgePadding,
      right: edgePadding,
      bottom: edgePadding,
      left: edgePadding,
    };
  }

  const x = edgePadding.x ?? 0;
  const y = edgePadding.y ?? 0;

  return {
    top: edgePadding.top ?? y,
    right: edgePadding.right ?? x,
    bottom: edgePadding.bottom ?? y,
    left: edgePadding.left ?? x,
  };
}

function makeLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  normalOverride?: { x: number; y: number },
): LineSegment {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const tx = dx / length;
  const ty = dy / length;
  const normal = normalOverride
    ? normalize(normalOverride.x, normalOverride.y)
    : { x: -ty, y: tx };

  return {
    kind: "line",
    length,
    nx: normal.x,
    ny: normal.y,
    tx,
    ty,
    x1,
    x2,
    y1,
    y2,
  };
}

function makeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): ArcSegment {
  const sweep = endAngle - startAngle;

  return {
    kind: "arc",
    centerX,
    centerY,
    direction: Math.sign(sweep),
    endAngle,
    length: Math.abs(sweep) * radius,
    radius,
    startAngle,
  };
}

export function buildTickerMesh(
  path: EdgePath,
  strip: TextStrip,
  options: TickerOptions,
) {
  const columns = buildMeshColumns(path, options.columnStep);
  const rowCount = Math.max(2, Math.ceil(strip.cssHeight / options.rowStep));
  const vertices: number[] = [];

  for (
    let columnIndex = 0;
    columnIndex < columns.length - 1;
    columnIndex += 1
  ) {
    const leftColumn = columns[columnIndex];
    const rightColumn = columns[columnIndex + 1];

    for (let row = 0; row < rowCount; row += 1) {
      const sourceY1 = (row / rowCount) * strip.cssHeight;
      const sourceY2 = ((row + 1) / rowCount) * strip.cssHeight;

      pushMeshVertex(vertices, leftColumn, sourceY1, strip);
      pushMeshVertex(vertices, rightColumn, sourceY1, strip);
      pushMeshVertex(vertices, leftColumn, sourceY2, strip);
      pushMeshVertex(vertices, leftColumn, sourceY2, strip);
      pushMeshVertex(vertices, rightColumn, sourceY1, strip);
      pushMeshVertex(vertices, rightColumn, sourceY2, strip);
    }
  }

  return new Float32Array(vertices);
}

function buildMeshColumns(path: EdgePath, maxArcStep: number) {
  const columns: MeshColumn[] = [];
  let walked = 0;

  path.segments.forEach((segment) => {
    const steps =
      segment.kind === "arc"
        ? Math.max(1, Math.ceil(segment.length / maxArcStep))
        : 1;

    for (let step = 0; step <= steps; step += 1) {
      if (columns.length > 0 && step === 0) {
        continue;
      }

      const localDistance = (segment.length * step) / steps;
      columns.push({
        pathDistance: walked + localDistance,
        sample: sampleSegment(segment, localDistance),
      });
    }

    walked += segment.length;
  });

  return columns;
}

function pushMeshVertex(
  vertices: number[],
  column: MeshColumn,
  sourceY: number,
  strip: TextStrip,
) {
  const localY = sourceY - strip.midline;

  vertices.push(
    column.sample.x + column.sample.nx * localY,
    column.sample.y + column.sample.ny * localY,
    column.pathDistance,
    sourceY / strip.cssHeight,
  );
}

function sampleSegment(segment: PathSegment, localDistance: number): PathSample {
  if (segment.kind === "line") {
    return {
      nx: segment.nx,
      ny: segment.ny,
      tx: segment.tx,
      ty: segment.ty,
      x: segment.x1 + segment.tx * localDistance,
      y: segment.y1 + segment.ty * localDistance,
    };
  }

  const angle =
    segment.startAngle + segment.direction * (localDistance / segment.radius);
  const tx = -Math.sin(angle) * segment.direction;
  const ty = Math.cos(angle) * segment.direction;

  return {
    curveRadius: segment.radius,
    nx: -ty,
    ny: tx,
    tx,
    ty,
    x: segment.centerX + Math.cos(angle) * segment.radius,
    y: segment.centerY + Math.sin(angle) * segment.radius,
  };
}

function normalize(x: number, y: number) {
  const length = Math.hypot(x, y);

  return {
    x: x / length,
    y: y / length,
  };
}
