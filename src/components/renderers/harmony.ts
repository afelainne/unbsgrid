import paper from 'paper';
import { hexToColor, intersectsAnyPath, showIfIntersects, computeVisualCentroid, type StyleConfig, type RenderContext } from './utils';

// Helper: get the effective bounds — use real content bounds when available
function getEffectiveBounds(bounds: paper.Rectangle, context?: RenderContext): paper.Rectangle {
  if (context?.useRealData && context?.contentBounds) {
    return context.contentBounds;
  }
  return bounds;
}

export function renderRootRectangles(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const eb = getEffectiveBounds(bounds, context);
  const actualRatio = eb.width / eb.height;

  const roots = [
    { name: '√2', value: Math.SQRT2 },
    { name: '√3', value: Math.sqrt(3) },
    { name: '√5', value: Math.sqrt(5) },
  ];

  const cx = eb.center.x;
  const cy = eb.center.y;

  roots.forEach((root) => {
    // Check both landscape and portrait orientations
    const ratioLandscape = root.value;
    const ratioPortrait = 1 / root.value;
    const diffLandscape = Math.abs(actualRatio - ratioLandscape);
    const diffPortrait = Math.abs(actualRatio - ratioPortrait);
    const bestDiff = Math.min(diffLandscape, diffPortrait);
    const usePortrait = diffPortrait < diffLandscape;

    // Closeness determines visual emphasis (0 = perfect match)
    const closeness = bestDiff / Math.max(ratioLandscape, 1);
    const opacity = closeness < 0.05 ? 1.0 : closeness < 0.15 ? 0.7 : closeness < 0.4 ? 0.45 : 0.25;
    const sw = closeness < 0.05 ? style.strokeWidth * 2 : closeness < 0.15 ? style.strokeWidth * 1.3 : style.strokeWidth;

    // Size the root rectangle to match the content's larger dimension
    let rw: number, rh: number;
    if (usePortrait) {
      rh = eb.height;
      rw = rh / root.value;
    } else {
      rw = eb.width;
      rh = rw / root.value;
    }

    const color = hexToColor(style.color, style.opacity * opacity);
    const rect = new paper.Path.Rectangle(
      new paper.Point(cx - rw / 2, cy - rh / 2),
      new paper.Point(cx + rw / 2, cy + rh / 2)
    );
    showIfIntersects(rect, context, () => {
      rect.strokeColor = color;
      rect.strokeWidth = sw;
      rect.fillColor = null;
      rect.dashArray = closeness < 0.05 ? [] : [8, 4];

      // Label with match percentage
      const matchPct = Math.max(0, (1 - bestDiff / Math.max(actualRatio, 1 / actualRatio)) * 100);
      const labelText = closeness < 0.05
        ? `${root.name} ✓ ${matchPct.toFixed(0)}%`
        : `${root.name} (${matchPct.toFixed(0)}%)`;
      const label = new paper.PointText(new paper.Point(cx + rw / 2 + 6, cy - rh / 2 + 10));
      label.content = labelText;
      label.fillColor = color;
      label.fontSize = closeness < 0.05 ? 10 : 8;
      label.fontWeight = closeness < 0.05 ? 'bold' : 'normal';
    });
  });

  // Show the actual content bounding box for reference
  if (context?.useRealData && context?.contentBounds) {
    const refRect = new paper.Path.Rectangle(eb);
    const refColor = hexToColor(style.color, style.opacity * 0.3);
    refRect.strokeColor = refColor;
    refRect.strokeWidth = style.strokeWidth * 0.5;
    refRect.fillColor = null;
    refRect.dashArray = [2, 2];

    const ratioLabel = new paper.PointText(new paper.Point(eb.right + 6, eb.bottom - 4));
    ratioLabel.content = `ratio: ${actualRatio.toFixed(3)}`;
    ratioLabel.fillColor = refColor;
    ratioLabel.fontSize = 7;
  }
}

export function renderModularScale(
  bounds: paper.Rectangle,
  style: StyleConfig,
  ratio: number = 1.618,
  context?: RenderContext
) {
  const eb = getEffectiveBounds(bounds, context);

  // Center on visual centroid when real data available, otherwise bounds center
  let cx: number, cy: number;
  if (context?.useRealData && context?.actualPaths && context.actualPaths.length > 0) {
    const centroid = computeVisualCentroid(context.actualPaths);
    cx = centroid.x;
    cy = centroid.y;
  } else {
    cx = eb.center.x;
    cy = eb.center.y;
  }

  // Base radius from smallest dimension of actual content
  const minDim = Math.min(eb.width, eb.height);
  const maxDim = Math.max(eb.width, eb.height);

  // Find the scale step that makes the first circle fit the smallest content feature
  // Start from a radius that encompasses the nearest path point
  let baseRadius: number;
  if (context?.useRealData && context?.actualPaths && context.actualPaths.length > 0) {
    // Find minimum distance from centroid to any path
    let minDist = Infinity;
    for (const p of context.actualPaths) {
      const nearest = p.getNearestPoint(new paper.Point(cx, cy));
      const d = nearest.getDistance(new paper.Point(cx, cy));
      if (d > 0 && d < minDist) minDist = d;
    }
    baseRadius = minDist > 0 && minDist < minDim ? minDist : minDim * 0.08;
  } else {
    baseRadius = minDim * 0.08;
  }

  // Show centroid marker
  if (context?.useRealData) {
    const marker = new paper.Path.Circle(new paper.Point(cx, cy), 3);
    marker.fillColor = hexToColor(style.color, style.opacity * 0.8);
    marker.strokeColor = null;
  }

  for (let i = 0; i < 10; i++) {
    const r = baseRadius * Math.pow(ratio, i);
    if (r > maxDim * 2) break;

    const circle = new paper.Path.Circle(new paper.Point(cx, cy), r);
    const circleColor = hexToColor(style.color, style.opacity * (1 - i * 0.08));

    // When using real data, check how many paths this ring touches
    let pathCount = 0;
    if (context?.useRealData && context?.actualPaths) {
      for (const p of context.actualPaths) {
        if (circle.getIntersections(p as any).length > 0) pathCount++;
      }
    }

    const isSignificant = pathCount > 0;

    showIfIntersects(circle, context, () => {
      circle.strokeColor = circleColor;
      circle.strokeWidth = isSignificant ? style.strokeWidth * 1.5 : style.strokeWidth;
      circle.fillColor = null;
      circle.dashArray = isSignificant ? [] : [4, 4];

      if (r > 15) {
        const labelText = context?.useRealData && pathCount > 0
          ? `×${ratio.toFixed(2)}^${i} (${pathCount})`
          : `×${ratio.toFixed(3)}^${i}`;
        const label = new paper.PointText(new paper.Point(cx + r + 5, cy - 3));
        label.content = labelText;
        label.fillColor = hexToColor(style.color, style.opacity * 0.7);
        label.fontSize = 8;
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
  const eb = getEffectiveBounds(bounds, context);
  const color = hexToColor(style.color, style.opacity);
  const fillColor = hexToColor(style.color, style.opacity * 0.06);
  const insetX = eb.width * margin;
  const insetY = eb.height * margin;

  const safeRect = new paper.Path.Rectangle(
    new paper.Point(eb.left + insetX, eb.top + insetY),
    new paper.Point(eb.right - insetX, eb.bottom - insetY)
  );
  safeRect.strokeColor = color;
  safeRect.strokeWidth = style.strokeWidth * 1.5;
  safeRect.fillColor = null;
  safeRect.dashArray = [8, 4];

  // Fill the outside area (4 rects) – red if paths bleed into margins
  const outerRects = [
    [eb.left, eb.top, eb.right, eb.top + insetY],
    [eb.left, eb.bottom - insetY, eb.right, eb.bottom],
    [eb.left, eb.top + insetY, eb.left + insetX, eb.bottom - insetY],
    [eb.right - insetX, eb.top + insetY, eb.right, eb.bottom - insetY],
  ];

  let bleedCount = 0;
  outerRects.forEach(([x1, y1, x2, y2]) => {
    const r = new paper.Path.Rectangle(new paper.Point(x1, y1), new paper.Point(x2, y2));
    if (context?.useRealData && context?.actualPaths) {
      const hasPathOutside = intersectsAnyPath(r, context.actualPaths);
      if (hasPathOutside) bleedCount++;
      r.fillColor = hasPathOutside ? hexToColor('#ff4444', style.opacity * 0.12) : fillColor;
    } else {
      r.fillColor = fillColor;
    }
    r.strokeColor = null;
  });

  // Show content within safe zone
  if (context?.useRealData && context?.contentBounds) {
    const cb = context.contentBounds;
    // Check if content fits within safe zone
    const safeL = eb.left + insetX;
    const safeT = eb.top + insetY;
    const safeR = eb.right - insetX;
    const safeB = eb.bottom - insetY;
    const fitsInside = cb.left >= safeL && cb.top >= safeT && cb.right <= safeR && cb.bottom <= safeB;

    const statusLabel = new paper.PointText(new paper.Point(eb.left + insetX + 4, eb.top + insetY + 12));
    statusLabel.content = fitsInside ? 'SAFE ZONE ✓' : `SAFE ZONE ✗ (${bleedCount} bleeds)`;
    statusLabel.fillColor = fitsInside ? hexToColor('#22cc44', style.opacity * 0.8) : hexToColor('#ff4444', style.opacity * 0.8);
    statusLabel.fontSize = 8;
    statusLabel.fontWeight = 'bold';
  } else {
    const label = new paper.PointText(new paper.Point(eb.left + insetX + 4, eb.top + insetY + 12));
    label.content = 'SAFE ZONE';
    label.fillColor = hexToColor(style.color, style.opacity * 0.6);
    label.fontSize = 8;
    label.fontWeight = 'bold';
  }
}

export function renderFibonacciOverlay(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const eb = getEffectiveBounds(bounds, context);
  const dimColor = hexToColor(style.color, style.opacity * 0.5);
  const labelColor = hexToColor(style.color, style.opacity * 0.7);
  const PHI = (1 + Math.sqrt(5)) / 2;

  // Fit a golden rectangle inside the effective content bounds
  let w: number, h: number;
  if (eb.width / eb.height >= PHI) {
    h = eb.height;
    w = h * PHI;
  } else {
    w = eb.width;
    h = w / PHI;
  }

  let x = eb.center.x - w / 2;
  let y = eb.center.y - h / 2;

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
      case 0: { sx = x; sy = y; x += s; w -= s; break; }
      case 1: { sx = x; sy = y; y += s; h -= s; break; }
      case 2: { sx = x + w - s; sy = y; w -= s; break; }
      case 3: { sx = x; sy = y + h - s; h -= s; break; }
      default: continue;
    }

    const sqRect = new paper.Rectangle(new paper.Point(sx, sy), new paper.Size(s, s));

    // Check how much real content falls in this square
    let coverage = 0;
    if (context?.useRealData && context?.actualPaths) {
      for (const p of context.actualPaths) {
        if (sqRect.intersects(p.bounds)) coverage++;
      }
    }

    const hasCoverage = coverage > 0;
    const rectColor = hexToColor(style.color, style.opacity * (hasCoverage ? 0.6 : 0.2));
    const fillC = hexToColor(style.color, style.opacity * (hasCoverage ? 0.06 : 0.02));
    const rect = new paper.Path.Rectangle(sqRect);
    showIfIntersects(rect, context, () => {
      rect.strokeColor = rectColor;
      rect.strokeWidth = hasCoverage ? style.strokeWidth * 1.3 : style.strokeWidth * 0.6;
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
  const eb = getEffectiveBounds(bounds, context);
  const color = hexToColor(style.color, style.opacity);
  const fillColor = hexToColor(style.color, style.opacity * 0.06);

  const cx = eb.center.x;
  const cy = eb.center.y;

  // Classic vesica piscis: two circles of radius r, separated by distance r
  // r = content height / 2 (fits the content vertically)
  const r = eb.height / 2;
  // Classic separation = r (circles overlap by r, creating the vesica)
  const d = r;

  // Left circle
  const c1 = new paper.Path.Circle(new paper.Point(cx - d / 2, cy), r);
  showIfIntersects(c1, context, () => {
    c1.strokeColor = color;
    c1.strokeWidth = style.strokeWidth;
    c1.fillColor = null;
  });

  // Right circle
  const c2 = new paper.Path.Circle(new paper.Point(cx + d / 2, cy), r);
  showIfIntersects(c2, context, () => {
    c2.strokeColor = color;
    c2.strokeWidth = style.strokeWidth;
    c2.fillColor = null;
  });

  // The vesica piscis area (the lens/mandorla shape)
  // Width of vesica = 2 * sqrt(r² - (d/2)²)
  // Height of vesica = 2 * r * sin(arccos(d / (2r)))
  const halfW = Math.sqrt(r * r - (d / 2) * (d / 2));
  const vesica = new paper.Path.Ellipse(new paper.Rectangle(
    new paper.Point(cx - halfW * 0.95, cy - r * 0.87),
    new paper.Point(cx + halfW * 0.95, cy + r * 0.87)
  ));
  showIfIntersects(vesica, context, () => {
    vesica.strokeColor = hexToColor(style.color, style.opacity * 0.7);
    vesica.strokeWidth = style.strokeWidth * 0.8;
    vesica.fillColor = fillColor;
    vesica.dashArray = [4, 3];
  });

  // Center vertical axis (sacred geometry axis)
  const axis = new paper.Path.Line(new paper.Point(cx, cy - r), new paper.Point(cx, cy + r));
  showIfIntersects(axis, context, () => {
    axis.strokeColor = hexToColor(style.color, style.opacity * 0.4);
    axis.strokeWidth = style.strokeWidth * 0.5;
    axis.dashArray = [3, 3];
  });

  // Horizontal axis
  const hAxis = new paper.Path.Line(new paper.Point(cx - d / 2 - r, cy), new paper.Point(cx + d / 2 + r, cy));
  showIfIntersects(hAxis, context, () => {
    hAxis.strokeColor = hexToColor(style.color, style.opacity * 0.3);
    hAxis.strokeWidth = style.strokeWidth * 0.5;
    hAxis.dashArray = [3, 3];
  });

  // Show how content relates to the vesica
  if (context?.useRealData && context?.actualPaths) {
    // Count paths inside vesica area vs outside
    let insideVesica = 0;
    let total = 0;
    for (const p of context.actualPaths) {
      total++;
      const pc = p.bounds.center;
      // Check if path center is inside the vesica region (between the two circles)
      const dLeft = pc.getDistance(new paper.Point(cx - d / 2, cy));
      const dRight = pc.getDistance(new paper.Point(cx + d / 2, cy));
      if (dLeft <= r && dRight <= r) insideVesica++;
    }
    const pct = total > 0 ? Math.round((insideVesica / total) * 100) : 0;

    const label = new paper.PointText(new paper.Point(cx, eb.top - 8));
    label.content = `VESICA PISCIS (${pct}% content inside)`;
    label.fillColor = hexToColor(style.color, style.opacity * 0.6);
    label.fontSize = 7;
    label.fontWeight = 'bold';
    label.justification = 'center';
  } else {
    const label = new paper.PointText(new paper.Point(cx, eb.top - 8));
    label.content = 'VESICA PISCIS';
    label.fillColor = hexToColor(style.color, style.opacity * 0.6);
    label.fontSize = 7;
    label.fontWeight = 'bold';
    label.justification = 'center';
  }
}
