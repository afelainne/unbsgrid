import paper from 'paper';
import type { BezierSegmentData } from '@/lib/svg-engine';

const PHI = (1 + Math.sqrt(5)) / 2;

function hexToColor(hex: string, opacity: number): paper.Color {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new paper.Color(r, g, b, opacity);
}

interface StyleConfig {
  color: string;
  opacity: number;
  strokeWidth: number;
}

export function renderBoundingRects(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  scaledCompBounds.forEach(cb => {
    const rect = new paper.Path.Rectangle(cb);
    rect.strokeColor = color;
    rect.strokeWidth = style.strokeWidth;
    rect.fillColor = null;
    rect.dashArray = [4, 3];
  });
  const fullRect = new paper.Path.Rectangle(bounds);
  fullRect.strokeColor = hexToColor(style.color, style.opacity * 0.7);
  fullRect.strokeWidth = style.strokeWidth * 1.2;
  fullRect.fillColor = null;
}

export function renderCircles(
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const dimColor = hexToColor(style.color, style.opacity * 0.6);
  scaledCompBounds.forEach(cb => {
    const cx = cb.center.x;
    const cy = cb.center.y;
    const inscribedR = Math.min(cb.width, cb.height) / 2;
    const inscribed = new paper.Path.Circle(new paper.Point(cx, cy), inscribedR);
    inscribed.strokeColor = color;
    inscribed.strokeWidth = style.strokeWidth;
    inscribed.fillColor = null;

    const circumR = Math.sqrt(cb.width * cb.width + cb.height * cb.height) / 2;
    const circum = new paper.Path.Circle(new paper.Point(cx, cy), circumR);
    circum.strokeColor = dimColor;
    circum.strokeWidth = style.strokeWidth;
    circum.fillColor = null;
    circum.dashArray = [6, 4];
  });
}

export function renderCenterLines(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const dimColor = hexToColor(style.color, style.opacity * 0.5);

  const hLine = new paper.Path.Line(
    new paper.Point(bounds.left - 30, bounds.center.y),
    new paper.Point(bounds.right + 30, bounds.center.y)
  );
  hLine.strokeColor = color;
  hLine.strokeWidth = style.strokeWidth;
  hLine.dashArray = [8, 4];

  const vLine = new paper.Path.Line(
    new paper.Point(bounds.center.x, bounds.top - 30),
    new paper.Point(bounds.center.x, bounds.bottom + 30)
  );
  vLine.strokeColor = color;
  vLine.strokeWidth = style.strokeWidth;
  vLine.dashArray = [8, 4];

  scaledCompBounds.forEach(cb => {
    if (Math.abs(cb.center.x - bounds.center.x) > 2 || Math.abs(cb.center.y - bounds.center.y) > 2) {
      const ch = new paper.Path.Line(
        new paper.Point(cb.left - 10, cb.center.y),
        new paper.Point(cb.right + 10, cb.center.y)
      );
      ch.strokeColor = dimColor;
      ch.strokeWidth = style.strokeWidth * 0.5;
      ch.dashArray = [4, 3];

      const cv = new paper.Path.Line(
        new paper.Point(cb.center.x, cb.top - 10),
        new paper.Point(cb.center.x, cb.bottom + 10)
      );
      cv.strokeColor = dimColor;
      cv.strokeWidth = style.strokeWidth * 0.5;
      cv.dashArray = [4, 3];
    }
  });
}

export function renderDiagonals(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const dimColor = hexToColor(style.color, style.opacity * 0.5);

  const d1 = new paper.Path.Line(new paper.Point(bounds.left, bounds.top), new paper.Point(bounds.right, bounds.bottom));
  d1.strokeColor = color;
  d1.strokeWidth = style.strokeWidth;

  const d2 = new paper.Path.Line(new paper.Point(bounds.right, bounds.top), new paper.Point(bounds.left, bounds.bottom));
  d2.strokeColor = color;
  d2.strokeWidth = style.strokeWidth;

  scaledCompBounds.forEach(cb => {
    const cd1 = new paper.Path.Line(new paper.Point(cb.left, cb.top), new paper.Point(cb.right, cb.bottom));
    cd1.strokeColor = dimColor;
    cd1.strokeWidth = style.strokeWidth * 0.5;

    const cd2 = new paper.Path.Line(new paper.Point(cb.right, cb.top), new paper.Point(cb.left, cb.bottom));
    cd2.strokeColor = dimColor;
    cd2.strokeWidth = style.strokeWidth * 0.5;
  });
}

export function renderGoldenRatio(
  bounds: paper.Rectangle,
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const dimColor = hexToColor(style.color, style.opacity * 0.5);
  const cx = bounds.center.x;
  const cy = bounds.center.y;
  const baseRadius = Math.min(bounds.width, bounds.height) / 2;

  const fibSequence = [1, 1, 2, 3, 5, 8, 13];
  const maxFib = fibSequence[fibSequence.length - 1];

  fibSequence.forEach(fib => {
    const r = (fib / maxFib) * baseRadius;
    const circle = new paper.Path.Circle(new paper.Point(cx, cy), r);
    circle.strokeColor = color;
    circle.strokeWidth = style.strokeWidth;
    circle.fillColor = null;

    if (r > 12) {
      const label = new paper.PointText(new paper.Point(cx + r + 4, cy - 2));
      label.content = String(fib);
      label.fillColor = hexToColor(style.color, style.opacity * 0.8);
      label.fontSize = 9;
      label.fontWeight = 'bold';
    }
  });

  const grWidth = bounds.width;
  const grHeight = grWidth / PHI;
  const grRect = new paper.Path.Rectangle(
    new paper.Point(cx - grWidth / 2, cy - grHeight / 2),
    new paper.Point(cx + grWidth / 2, cy + grHeight / 2)
  );
  grRect.strokeColor = dimColor;
  grRect.strokeWidth = style.strokeWidth;
  grRect.fillColor = null;
  grRect.dashArray = [6, 4];
}

export function renderTangentLines(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  scaledCompBounds.forEach(cb => {
    [cb.top, cb.bottom].forEach(y => {
      const line = new paper.Path.Line(new paper.Point(bounds.left - 40, y), new paper.Point(bounds.right + 40, y));
      line.strokeColor = color;
      line.strokeWidth = style.strokeWidth;
      line.dashArray = [2, 3];
    });
    [cb.left, cb.right].forEach(x => {
      const line = new paper.Path.Line(new paper.Point(x, bounds.top - 40), new paper.Point(x, bounds.bottom + 40));
      line.strokeColor = color;
      line.strokeWidth = style.strokeWidth;
      line.dashArray = [2, 3];
    });
  });
}

export function renderGoldenSpiral(
  bounds: paper.Rectangle,
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  
  // Draw golden spiral using successive quarter arcs in nested golden rectangles
  let w = bounds.width;
  let h = bounds.width / PHI;
  let x = bounds.center.x - w / 2;
  let y = bounds.center.y - h / 2;

  for (let i = 0; i < 10; i++) {
    const dir = i % 4;
    let cx: number, cy: number, r: number, from: number, through: number, to: number;
    
    if (dir === 0) {
      r = h;
      cx = x + w - h;
      cy = y + h;
      from = -90;
      to = 0;
      // Draw arc
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((-90 * Math.PI) / 180), cy + r * Math.sin((-90 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((-45 * Math.PI) / 180), cy + r * Math.sin((-45 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((0 * Math.PI) / 180), cy + r * Math.sin((0 * Math.PI) / 180))
      );
      arc.strokeColor = color;
      arc.strokeWidth = style.strokeWidth;
      arc.fillColor = null;
      // Next rect
      const newH = w - h;
      y = y;
      x = x;
      w = w - h + (h - newH);
      w = h;
      h = newH;
    } else if (dir === 1) {
      r = w;
      cx = x;
      cy = y + w;
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((0 * Math.PI) / 180), cy + r * Math.sin((0 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((45 * Math.PI) / 180), cy + r * Math.sin((45 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((90 * Math.PI) / 180), cy + r * Math.sin((90 * Math.PI) / 180))
      );
      arc.strokeColor = color;
      arc.strokeWidth = style.strokeWidth;
      arc.fillColor = null;
      const newW = h - w;
      x = x;
      y = y + w;
      h = w;
      w = newW;
    } else if (dir === 2) {
      r = h;
      cx = x + h;
      cy = y;
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((90 * Math.PI) / 180), cy + r * Math.sin((90 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((135 * Math.PI) / 180), cy + r * Math.sin((135 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((180 * Math.PI) / 180), cy + r * Math.sin((180 * Math.PI) / 180))
      );
      arc.strokeColor = color;
      arc.strokeWidth = style.strokeWidth;
      arc.fillColor = null;
      const newH = w - h;
      x = x + h;
      w = h;
      h = newH;
    } else {
      r = w;
      cx = x + w;
      cy = y + h - w;
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((180 * Math.PI) / 180), cy + r * Math.sin((180 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((225 * Math.PI) / 180), cy + r * Math.sin((225 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((270 * Math.PI) / 180), cy + r * Math.sin((270 * Math.PI) / 180))
      );
      arc.strokeColor = color;
      arc.strokeWidth = style.strokeWidth;
      arc.fillColor = null;
      const newW = h - w;
      y = y + h - w;
      h = w;
      w = newW;
    }

    if (w < 1 || h < 1) break;
  }
}

export function renderIsometricGrid(
  bounds: paper.Rectangle,
  style: StyleConfig,
  subdivisions: number
) {
  const color = hexToColor(style.color, style.opacity);
  const cx = bounds.center.x;
  const cy = bounds.center.y;
  const extent = Math.max(bounds.width, bounds.height) * 1.2;
  const step = Math.min(bounds.width, bounds.height) / subdivisions;

  const angles = [30, 150]; // isometric angles

  angles.forEach(angleDeg => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(angleRad);
    const dy = Math.sin(angleRad);
    const perpDx = -dy;
    const perpDy = dx;

    for (let i = -subdivisions; i <= subdivisions; i++) {
      const offsetX = perpDx * step * i;
      const offsetY = perpDy * step * i;
      const line = new paper.Path.Line(
        new paper.Point(cx + offsetX - dx * extent, cy + offsetY - dy * extent),
        new paper.Point(cx + offsetX + dx * extent, cy + offsetY + dy * extent)
      );
      line.strokeColor = color;
      line.strokeWidth = style.strokeWidth;
      if (i !== 0) line.dashArray = [4, 4];
    }
  });

  // Vertical lines
  for (let i = -subdivisions; i <= subdivisions; i++) {
    const x = cx + step * i;
    const line = new paper.Path.Line(
      new paper.Point(x, cy - extent),
      new paper.Point(x, cy + extent)
    );
    line.strokeColor = color;
    line.strokeWidth = style.strokeWidth * 0.5;
    line.dashArray = [2, 4];
  }
}

export function renderBezierHandles(
  segments: BezierSegmentData[],
  originalBounds: paper.Rectangle,
  canvasBounds: paper.Rectangle,
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const handleColor = hexToColor(style.color, style.opacity * 0.7);

  // Map original coords to canvas coords
  const mapX = (x: number) =>
    canvasBounds.left + ((x - originalBounds.left) / originalBounds.width) * canvasBounds.width;
  const mapY = (y: number) =>
    canvasBounds.top + ((y - originalBounds.top) / originalBounds.height) * canvasBounds.height;

  segments.forEach(seg => {
    const ax = mapX(seg.anchor.x);
    const ay = mapY(seg.anchor.y);

    // Anchor point
    const dot = new paper.Path.Circle(new paper.Point(ax, ay), style.strokeWidth * 1.5 + 1);
    dot.fillColor = color;
    dot.strokeColor = null;

    if (seg.hasHandleIn) {
      const hx = mapX(seg.handleIn.x);
      const hy = mapY(seg.handleIn.y);
      const line = new paper.Path.Line(new paper.Point(ax, ay), new paper.Point(hx, hy));
      line.strokeColor = handleColor;
      line.strokeWidth = style.strokeWidth * 0.6;
      const hdot = new paper.Path.Circle(new paper.Point(hx, hy), style.strokeWidth + 0.5);
      hdot.fillColor = handleColor;
      hdot.strokeColor = null;
    }

    if (seg.hasHandleOut) {
      const hx = mapX(seg.handleOut.x);
      const hy = mapY(seg.handleOut.y);
      const line = new paper.Path.Line(new paper.Point(ax, ay), new paper.Point(hx, hy));
      line.strokeColor = handleColor;
      line.strokeWidth = style.strokeWidth * 0.6;
      const hdot = new paper.Path.Circle(new paper.Point(hx, hy), style.strokeWidth + 0.5);
      hdot.fillColor = handleColor;
      hdot.strokeColor = null;
    }
  });
}

export function renderTypographicProportions(
  bounds: paper.Rectangle,
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const labelColor = hexToColor(style.color, style.opacity * 0.8);

  const guides = [
    { name: 'Descender', ratio: 1.15 },
    { name: 'Baseline', ratio: 1.0 },
    { name: 'x-height', ratio: 0.4 },
    { name: 'Cap height', ratio: 0.0 },
    { name: 'Ascender', ratio: -0.1 },
  ];

  guides.forEach(g => {
    const y = bounds.top + g.ratio * bounds.height;
    const line = new paper.Path.Line(
      new paper.Point(bounds.left - 60, y),
      new paper.Point(bounds.right + 30, y)
    );
    line.strokeColor = color;
    line.strokeWidth = style.strokeWidth;
    line.dashArray = [6, 3];

    const label = new paper.PointText(new paper.Point(bounds.left - 65, y + 3));
    label.content = g.name;
    label.fillColor = labelColor;
    label.fontSize = 8;
    label.justification = 'right';
  });
}

export function renderThirdLines(
  bounds: paper.Rectangle,
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const dotColor = hexToColor(style.color, style.opacity * 0.8);

  for (let i = 1; i <= 2; i++) {
    const x = bounds.left + (bounds.width * i) / 3;
    const line = new paper.Path.Line(
      new paper.Point(x, bounds.top - 20),
      new paper.Point(x, bounds.bottom + 20)
    );
    line.strokeColor = color;
    line.strokeWidth = style.strokeWidth;
    line.dashArray = [6, 4];

    const y = bounds.top + (bounds.height * i) / 3;
    const hLine = new paper.Path.Line(
      new paper.Point(bounds.left - 20, y),
      new paper.Point(bounds.right + 20, y)
    );
    hLine.strokeColor = color;
    hLine.strokeWidth = style.strokeWidth;
    hLine.dashArray = [6, 4];
  }

  // Intersection markers
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 2; j++) {
      const x = bounds.left + (bounds.width * i) / 3;
      const y = bounds.top + (bounds.height * j) / 3;
      const dot = new paper.Path.Circle(new paper.Point(x, y), style.strokeWidth * 2 + 1);
      dot.fillColor = dotColor;
      dot.strokeColor = null;
    }
  }
}
