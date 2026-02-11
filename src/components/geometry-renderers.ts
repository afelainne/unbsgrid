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

// ===================== NEW GEOMETRY RENDERERS =====================

export function renderSymmetryAxes(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const dimColor = hexToColor(style.color, style.opacity * 0.6);

  // Global symmetry axes
  const vAxis = new paper.Path.Line(
    new paper.Point(bounds.center.x, bounds.top - 40),
    new paper.Point(bounds.center.x, bounds.bottom + 40)
  );
  vAxis.strokeColor = color;
  vAxis.strokeWidth = style.strokeWidth * 1.2;
  vAxis.dashArray = [10, 4, 2, 4];

  const hAxis = new paper.Path.Line(
    new paper.Point(bounds.left - 40, bounds.center.y),
    new paper.Point(bounds.right + 40, bounds.center.y)
  );
  hAxis.strokeColor = color;
  hAxis.strokeWidth = style.strokeWidth * 1.2;
  hAxis.dashArray = [10, 4, 2, 4];

  // Small diamond markers at center
  const diamond = new paper.Path.RegularPolygon(bounds.center, 4, 5);
  diamond.strokeColor = color;
  diamond.strokeWidth = style.strokeWidth;
  diamond.fillColor = hexToColor(style.color, style.opacity * 0.2);
  diamond.rotation = 45;

  // Per-component axes
  scaledCompBounds.forEach(cb => {
    const cv = new paper.Path.Line(
      new paper.Point(cb.center.x, cb.top - 15),
      new paper.Point(cb.center.x, cb.bottom + 15)
    );
    cv.strokeColor = dimColor;
    cv.strokeWidth = style.strokeWidth * 0.6;
    cv.dashArray = [6, 3, 2, 3];

    const ch = new paper.Path.Line(
      new paper.Point(cb.left - 15, cb.center.y),
      new paper.Point(cb.right + 15, cb.center.y)
    );
    ch.strokeColor = dimColor;
    ch.strokeWidth = style.strokeWidth * 0.6;
    ch.dashArray = [6, 3, 2, 3];
  });
}

export function renderAngleMeasurements(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const labelColor = hexToColor(style.color, style.opacity * 0.9);

  // Measure diagonal angle of the full bounds
  const diagAngle = Math.atan2(bounds.height, bounds.width) * (180 / Math.PI);
  const arcRadius = Math.min(bounds.width, bounds.height) * 0.15;

  // Bottom-left corner arc
  const arcPath = new paper.Path.Arc(
    new paper.Point(bounds.left + arcRadius, bounds.bottom),
    new paper.Point(
      bounds.left + arcRadius * Math.cos(diagAngle * Math.PI / 360),
      bounds.bottom - arcRadius * Math.sin(diagAngle * Math.PI / 360)
    ),
    new paper.Point(
      bounds.left + arcRadius * Math.cos(diagAngle * Math.PI / 180),
      bounds.bottom - arcRadius * Math.sin(diagAngle * Math.PI / 180)
    )
  );
  arcPath.strokeColor = color;
  arcPath.strokeWidth = style.strokeWidth;
  arcPath.fillColor = null;

  const labelPt = new paper.Point(
    bounds.left + arcRadius * 1.4 * Math.cos(diagAngle * Math.PI / 360),
    bounds.bottom - arcRadius * 1.4 * Math.sin(diagAngle * Math.PI / 360)
  );
  const label = new paper.PointText(labelPt);
  label.content = `${diagAngle.toFixed(1)}°`;
  label.fillColor = labelColor;
  label.fontSize = 9;
  label.fontWeight = 'bold';

  // Per-component aspect ratio angles
  scaledCompBounds.forEach(cb => {
    const angle = Math.atan2(cb.height, cb.width) * (180 / Math.PI);
    const r = Math.min(cb.width, cb.height) * 0.2;
    if (r < 8) return;

    const arc = new paper.Path.Arc(
      new paper.Point(cb.left + r, cb.bottom),
      new paper.Point(cb.left + r * 0.85, cb.bottom - r * 0.5),
      new paper.Point(
        cb.left + r * Math.cos(angle * Math.PI / 180),
        cb.bottom - r * Math.sin(angle * Math.PI / 180)
      )
    );
    arc.strokeColor = hexToColor(style.color, style.opacity * 0.6);
    arc.strokeWidth = style.strokeWidth * 0.7;
    arc.fillColor = null;

    if (r > 15) {
      const lbl = new paper.PointText(new paper.Point(cb.left + r * 1.5, cb.bottom - r * 0.3));
      lbl.content = `${angle.toFixed(1)}°`;
      lbl.fillColor = hexToColor(style.color, style.opacity * 0.7);
      lbl.fontSize = 8;
    }
  });
}

export function renderSpacingGuides(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  const color = hexToColor(style.color, style.opacity);
  const labelColor = hexToColor(style.color, style.opacity * 0.9);
  const fillColor = hexToColor(style.color, style.opacity * 0.08);

  if (scaledCompBounds.length < 2) return;

  for (let i = 0; i < scaledCompBounds.length; i++) {
    for (let j = i + 1; j < scaledCompBounds.length; j++) {
      const a = scaledCompBounds[i];
      const b = scaledCompBounds[j];

      // Horizontal spacing
      const leftComp = a.center.x < b.center.x ? a : b;
      const rightComp = a.center.x < b.center.x ? b : a;
      const hGap = rightComp.left - leftComp.right;

      if (hGap > 5) {
        const midY = (leftComp.center.y + rightComp.center.y) / 2;
        // Spacing area
        const rect = new paper.Path.Rectangle(
          new paper.Point(leftComp.right, Math.min(leftComp.top, rightComp.top)),
          new paper.Point(rightComp.left, Math.max(leftComp.bottom, rightComp.bottom))
        );
        rect.fillColor = fillColor;
        rect.strokeColor = null;

        // Arrow line
        const line = new paper.Path.Line(
          new paper.Point(leftComp.right, midY),
          new paper.Point(rightComp.left, midY)
        );
        line.strokeColor = color;
        line.strokeWidth = style.strokeWidth;

        // Arrowheads
        const arrowSize = 4;
        const leftArrow = new paper.Path([
          new paper.Point(leftComp.right + arrowSize, midY - arrowSize),
          new paper.Point(leftComp.right, midY),
          new paper.Point(leftComp.right + arrowSize, midY + arrowSize),
        ]);
        leftArrow.strokeColor = color;
        leftArrow.strokeWidth = style.strokeWidth;

        const rightArrow = new paper.Path([
          new paper.Point(rightComp.left - arrowSize, midY - arrowSize),
          new paper.Point(rightComp.left, midY),
          new paper.Point(rightComp.left - arrowSize, midY + arrowSize),
        ]);
        rightArrow.strokeColor = color;
        rightArrow.strokeWidth = style.strokeWidth;

        // Label
        const lbl = new paper.PointText(new paper.Point((leftComp.right + rightComp.left) / 2, midY - 6));
        lbl.content = `${Math.round(hGap)}px`;
        lbl.fillColor = labelColor;
        lbl.fontSize = 9;
        lbl.fontWeight = 'bold';
        lbl.justification = 'center';
      }

      // Vertical spacing
      const topComp = a.center.y < b.center.y ? a : b;
      const bottomComp = a.center.y < b.center.y ? b : a;
      const vGap = bottomComp.top - topComp.bottom;

      if (vGap > 5) {
        const midX = (topComp.center.x + bottomComp.center.x) / 2;
        const line = new paper.Path.Line(
          new paper.Point(midX, topComp.bottom),
          new paper.Point(midX, bottomComp.top)
        );
        line.strokeColor = color;
        line.strokeWidth = style.strokeWidth;

        const arrowSize = 4;
        const topArrow = new paper.Path([
          new paper.Point(midX - arrowSize, topComp.bottom + arrowSize),
          new paper.Point(midX, topComp.bottom),
          new paper.Point(midX + arrowSize, topComp.bottom + arrowSize),
        ]);
        topArrow.strokeColor = color;
        topArrow.strokeWidth = style.strokeWidth;

        const bottomArrow = new paper.Path([
          new paper.Point(midX - arrowSize, bottomComp.top - arrowSize),
          new paper.Point(midX, bottomComp.top),
          new paper.Point(midX + arrowSize, bottomComp.top - arrowSize),
        ]);
        bottomArrow.strokeColor = color;
        bottomArrow.strokeWidth = style.strokeWidth;

        const lbl = new paper.PointText(new paper.Point(midX + 8, (topComp.bottom + bottomComp.top) / 2 + 3));
        lbl.content = `${Math.round(vGap)}px`;
        lbl.fillColor = labelColor;
        lbl.fontSize = 9;
        lbl.fontWeight = 'bold';
      }
    }
  }
}

export function renderRootRectangles(
  bounds: paper.Rectangle,
  style: StyleConfig
) {
  const roots = [
    { name: '√2', value: Math.SQRT2, opacity: 1.0 },
    { name: '√3', value: Math.sqrt(3), opacity: 0.7 },
    { name: '√5', value: Math.sqrt(5), opacity: 0.5 },
  ];

  const cx = bounds.center.x;
  const cy = bounds.center.y;
  const baseW = bounds.width;

  roots.forEach((root, idx) => {
    const h = baseW / root.value;
    const color = hexToColor(style.color, style.opacity * root.opacity);

    const rect = new paper.Path.Rectangle(
      new paper.Point(cx - baseW / 2, cy - h / 2),
      new paper.Point(cx + baseW / 2, cy + h / 2)
    );
    rect.strokeColor = color;
    rect.strokeWidth = style.strokeWidth;
    rect.fillColor = null;
    rect.dashArray = [8, 4];

    const label = new paper.PointText(new paper.Point(cx + baseW / 2 + 6, cy - h / 2 + 10));
    label.content = root.name;
    label.fillColor = color;
    label.fontSize = 9;
    label.fontWeight = 'bold';
  });
}

export function renderModularScale(
  bounds: paper.Rectangle,
  style: StyleConfig,
  ratio: number = 1.618
) {
  const color = hexToColor(style.color, style.opacity);
  const cx = bounds.center.x;
  const cy = bounds.center.y;
  const baseRadius = Math.min(bounds.width, bounds.height) * 0.08;

  for (let i = 0; i < 8; i++) {
    const r = baseRadius * Math.pow(ratio, i);
    if (r > Math.max(bounds.width, bounds.height) * 1.5) break;

    const circle = new paper.Path.Circle(new paper.Point(cx, cy), r);
    circle.strokeColor = hexToColor(style.color, style.opacity * (1 - i * 0.1));
    circle.strokeWidth = style.strokeWidth;
    circle.fillColor = null;
    circle.dashArray = i > 3 ? [4, 4] : [];

    if (i > 0 && r > 15) {
      const label = new paper.PointText(new paper.Point(cx + r + 5, cy - 3));
      label.content = `×${ratio.toFixed(3)}^${i}`;
      label.fillColor = hexToColor(style.color, style.opacity * 0.7);
      label.fontSize = 8;
    }
  }
}

export function renderAlignmentGuides(
  bounds: paper.Rectangle,
  scaledCompBounds: paper.Rectangle[],
  style: StyleConfig
) {
  if (scaledCompBounds.length < 2) return;

  const color = hexToColor(style.color, style.opacity);
  const dimColor = hexToColor(style.color, style.opacity * 0.4);
  const threshold = 3; // pixel tolerance for alignment detection

  const edges = scaledCompBounds.map(cb => ({
    top: cb.top, bottom: cb.bottom, left: cb.left, right: cb.right,
    centerX: cb.center.x, centerY: cb.center.y,
  }));

  // Check alignment between all pairs
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const a = edges[i], b = edges[j];
      const checks = [
        { aVal: a.top, bVal: b.top, y: true, label: 'top' },
        { aVal: a.bottom, bVal: b.bottom, y: true, label: 'bottom' },
        { aVal: a.centerY, bVal: b.centerY, y: true, label: 'center-y' },
        { aVal: a.left, bVal: b.left, y: false, label: 'left' },
        { aVal: a.right, bVal: b.right, y: false, label: 'right' },
        { aVal: a.centerX, bVal: b.centerX, y: false, label: 'center-x' },
      ];

      checks.forEach(check => {
        if (Math.abs(check.aVal - check.bVal) < threshold) {
          const avgVal = (check.aVal + check.bVal) / 2;
          if (check.y) {
            const line = new paper.Path.Line(
              new paper.Point(bounds.left - 30, avgVal),
              new paper.Point(bounds.right + 30, avgVal)
            );
            line.strokeColor = check.label.includes('center') ? color : dimColor;
            line.strokeWidth = style.strokeWidth;
            line.dashArray = [3, 3];
          } else {
            const line = new paper.Path.Line(
              new paper.Point(avgVal, bounds.top - 30),
              new paper.Point(avgVal, bounds.bottom + 30)
            );
            line.strokeColor = check.label.includes('center') ? color : dimColor;
            line.strokeWidth = style.strokeWidth;
            line.dashArray = [3, 3];
          }
        }
      });
    }
  }
}

export function renderSafeZone(
  bounds: paper.Rectangle,
  style: StyleConfig,
  margin: number = 0.1
) {
  const color = hexToColor(style.color, style.opacity);
  const fillColor = hexToColor(style.color, style.opacity * 0.06);

  const insetX = bounds.width * margin;
  const insetY = bounds.height * margin;

  const safeRect = new paper.Path.Rectangle(
    new paper.Point(bounds.left + insetX, bounds.top + insetY),
    new paper.Point(bounds.right - insetX, bounds.bottom - insetY)
  );
  safeRect.strokeColor = color;
  safeRect.strokeWidth = style.strokeWidth * 1.5;
  safeRect.fillColor = null;
  safeRect.dashArray = [8, 4];

  // Fill the outside area (4 rects)
  const outerRects = [
    [bounds.left, bounds.top, bounds.right, bounds.top + insetY],
    [bounds.left, bounds.bottom - insetY, bounds.right, bounds.bottom],
    [bounds.left, bounds.top + insetY, bounds.left + insetX, bounds.bottom - insetY],
    [bounds.right - insetX, bounds.top + insetY, bounds.right, bounds.bottom - insetY],
  ];
  outerRects.forEach(([x1, y1, x2, y2]) => {
    const r = new paper.Path.Rectangle(new paper.Point(x1, y1), new paper.Point(x2, y2));
    r.fillColor = fillColor;
    r.strokeColor = null;
  });

  // Label
  const label = new paper.PointText(new paper.Point(bounds.left + insetX + 4, bounds.top + insetY + 12));
  label.content = 'SAFE ZONE';
  label.fillColor = hexToColor(style.color, style.opacity * 0.6);
  label.fontSize = 8;
  label.fontWeight = 'bold';
}
