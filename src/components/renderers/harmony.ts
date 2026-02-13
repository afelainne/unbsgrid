import paper from 'paper';
import { hexToColor, intersectsAnyPath, showIfIntersects, type StyleConfig, type RenderContext } from './utils';

export function renderRootRectangles(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const roots = [
    { name: '√2', value: Math.SQRT2, opacity: 1.0 },
    { name: '√3', value: Math.sqrt(3), opacity: 0.7 },
    { name: '√5', value: Math.sqrt(5), opacity: 0.5 },
  ];

  const cx = bounds.center.x;
  const cy = bounds.center.y;
  const baseW = bounds.width;

  roots.forEach((root) => {
    const h = baseW / root.value;
    const color = hexToColor(style.color, style.opacity * root.opacity);

    const rect = new paper.Path.Rectangle(
      new paper.Point(cx - baseW / 2, cy - h / 2),
      new paper.Point(cx + baseW / 2, cy + h / 2)
    );
    showIfIntersects(rect, context, () => {
      rect.strokeColor = color; rect.strokeWidth = style.strokeWidth; rect.fillColor = null; rect.dashArray = [8, 4];
      const label = new paper.PointText(new paper.Point(cx + baseW / 2 + 6, cy - h / 2 + 10));
      label.content = root.name; label.fillColor = color; label.fontSize = 9; label.fontWeight = 'bold';
    });
  });
}

export function renderModularScale(
  bounds: paper.Rectangle,
  style: StyleConfig,
  ratio: number = 1.618,
  context?: RenderContext
) {
  const cx = bounds.center.x;
  const cy = bounds.center.y;
  const baseRadius = Math.min(bounds.width, bounds.height) * 0.08;

  for (let i = 0; i < 8; i++) {
    const r = baseRadius * Math.pow(ratio, i);
    if (r > Math.max(bounds.width, bounds.height) * 1.5) break;

    const circle = new paper.Path.Circle(new paper.Point(cx, cy), r);
    const circleColor = hexToColor(style.color, style.opacity * (1 - i * 0.1));
    showIfIntersects(circle, context, () => {
      circle.strokeColor = circleColor; circle.strokeWidth = style.strokeWidth; circle.fillColor = null;
      circle.dashArray = i > 3 ? [4, 4] : [];
      if (i > 0 && r > 15) {
        const label = new paper.PointText(new paper.Point(cx + r + 5, cy - 3));
        label.content = `×${ratio.toFixed(3)}^${i}`; label.fillColor = hexToColor(style.color, style.opacity * 0.7); label.fontSize = 8;
      }
    });
  }
}

export function renderSafeZone(
  bounds: paper.Rectangle,
  style: StyleConfig,
  margin: number = 0.1,
  context?: RenderContext
) {
  const color = hexToColor(style.color, style.opacity);
  const fillColor = hexToColor(style.color, style.opacity * 0.06);
  const insetX = bounds.width * margin;
  const insetY = bounds.height * margin;

  const safeRect = new paper.Path.Rectangle(
    new paper.Point(bounds.left + insetX, bounds.top + insetY),
    new paper.Point(bounds.right - insetX, bounds.bottom - insetY)
  );
  safeRect.strokeColor = color; safeRect.strokeWidth = style.strokeWidth * 1.5;
  safeRect.fillColor = null; safeRect.dashArray = [8, 4];

  const outerRects = [
    [bounds.left, bounds.top, bounds.right, bounds.top + insetY],
    [bounds.left, bounds.bottom - insetY, bounds.right, bounds.bottom],
    [bounds.left, bounds.top + insetY, bounds.left + insetX, bounds.bottom - insetY],
    [bounds.right - insetX, bounds.top + insetY, bounds.right, bounds.bottom - insetY],
  ];
  outerRects.forEach(([x1, y1, x2, y2]) => {
    const r = new paper.Path.Rectangle(new paper.Point(x1, y1), new paper.Point(x2, y2));
    if (context?.useRealData && context?.actualPaths) {
      const hasPathOutside = intersectsAnyPath(r, context.actualPaths);
      r.fillColor = hasPathOutside ? hexToColor('#ff4444', style.opacity * 0.12) : fillColor;
    } else {
      r.fillColor = fillColor;
    }
    r.strokeColor = null;
  });

  const label = new paper.PointText(new paper.Point(bounds.left + insetX + 4, bounds.top + insetY + 12));
  label.content = 'SAFE ZONE'; label.fillColor = hexToColor(style.color, style.opacity * 0.6);
  label.fontSize = 8; label.fontWeight = 'bold';
}

export function renderFibonacciOverlay(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const dimColor = hexToColor(style.color, style.opacity * 0.5);
  const labelColor = hexToColor(style.color, style.opacity * 0.7);
  const PHI = (1 + Math.sqrt(5)) / 2;

  // Fit a golden rectangle inside bounds
  let w: number, h: number;
  if (bounds.width / bounds.height >= PHI) {
    h = bounds.height;
    w = h * PHI;
  } else {
    w = bounds.width;
    h = w / PHI;
  }

  let x = bounds.center.x - w / 2;
  let y = bounds.center.y - h / 2;

  // Outer golden rectangle
  const outerRect = new paper.Path.Rectangle(
    new paper.Point(x, y), new paper.Size(w, h)
  );
  showIfIntersects(outerRect, context, () => {
    outerRect.strokeColor = dimColor;
    outerRect.strokeWidth = style.strokeWidth * 0.7;
    outerRect.fillColor = null;
    outerRect.dashArray = [4, 3];
  });

  // Fibonacci sequence for labels
  const fibs = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

  // Subdivide into squares cycling LEFT → TOP → RIGHT → BOTTOM
  for (let i = 0; i < 12; i++) {
    const s = Math.min(w, h);
    if (s < 0.5) break;

    const dir = i % 4;
    let sx: number, sy: number;

    switch (dir) {
      case 0: { // LEFT
        sx = x; sy = y;
        x += s; w -= s;
        break;
      }
      case 1: { // TOP
        sx = x; sy = y;
        y += s; h -= s;
        break;
      }
      case 2: { // RIGHT
        sx = x + w - s; sy = y;
        w -= s;
        break;
      }
      case 3: { // BOTTOM
        sx = x; sy = y + h - s;
        h -= s;
        break;
      }
      default: continue;
    }

    const rectColor = hexToColor(style.color, style.opacity * (0.3 + i * 0.06));
    const fillC = hexToColor(style.color, style.opacity * 0.04);
    const rect = new paper.Path.Rectangle(
      new paper.Point(sx, sy), new paper.Size(s, s)
    );
    showIfIntersects(rect, context, () => {
      rect.strokeColor = rectColor;
      rect.strokeWidth = style.strokeWidth;
      rect.fillColor = fillC;

      if (s > 10 && i < fibs.length) {
        const label = new paper.PointText(
          new paper.Point(sx + s / 2, sy + s / 2 + 3)
        );
        label.content = String(fibs[i]);
        label.fillColor = labelColor;
        label.fontSize = Math.max(6, Math.min(12, s * 0.25));
        label.justification = 'center';
      }
    });
  }
}

export function renderVesicaPiscis(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const color = hexToColor(style.color, style.opacity);
  const fillColor = hexToColor(style.color, style.opacity * 0.06);

  const r = bounds.height / 2;
  const cx = bounds.center.x;
  const cy = bounds.center.y;
  const offset = bounds.width / 3;

  const c1 = new paper.Path.Circle(new paper.Point(cx - offset / 2, cy), r);
  showIfIntersects(c1, context, () => { c1.strokeColor = color; c1.strokeWidth = style.strokeWidth; c1.fillColor = null; });

  const c2 = new paper.Path.Circle(new paper.Point(cx + offset / 2, cy), r);
  showIfIntersects(c2, context, () => { c2.strokeColor = color; c2.strokeWidth = style.strokeWidth; c2.fillColor = null; });

  const vesica = new paper.Path.Ellipse(new paper.Rectangle(
    new paper.Point(cx - offset * 0.3, cy - r * 0.85),
    new paper.Point(cx + offset * 0.3, cy + r * 0.85)
  ));
  showIfIntersects(vesica, context, () => {
    vesica.strokeColor = hexToColor(style.color, style.opacity * 0.7); vesica.strokeWidth = style.strokeWidth * 0.8;
    vesica.fillColor = fillColor; vesica.dashArray = [4, 3];
  });

  const axis = new paper.Path.Line(new paper.Point(cx, cy - r), new paper.Point(cx, cy + r));
  showIfIntersects(axis, context, () => {
    axis.strokeColor = hexToColor(style.color, style.opacity * 0.4); axis.strokeWidth = style.strokeWidth * 0.5; axis.dashArray = [3, 3];
  });

  const label = new paper.PointText(new paper.Point(cx, bounds.top - 8));
  label.content = 'VESICA PISCIS'; label.fillColor = hexToColor(style.color, style.opacity * 0.6);
  label.fontSize = 7; label.fontWeight = 'bold'; label.justification = 'center';
}
