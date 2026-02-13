import paper from 'paper';
import { hexToColor, showIfIntersects, PHI, type StyleConfig, type RenderContext } from './utils';

export function renderGoldenRatio(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
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
    showIfIntersects(circle, context, () => {
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
  });

  const grWidth = bounds.width;
  const grHeight = grWidth / PHI;
  const grRect = new paper.Path.Rectangle(
    new paper.Point(cx - grWidth / 2, cy - grHeight / 2),
    new paper.Point(cx + grWidth / 2, cy + grHeight / 2)
  );
  showIfIntersects(grRect, context, () => {
    grRect.strokeColor = dimColor;
    grRect.strokeWidth = style.strokeWidth;
    grRect.fillColor = null;
    grRect.dashArray = [6, 4];
  });
}

export function renderGoldenSpiral(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const color = hexToColor(style.color, style.opacity);

  let w = bounds.width;
  let h = bounds.width / PHI;
  let x = bounds.center.x - w / 2;
  let y = bounds.center.y - h / 2;

  for (let i = 0; i < 10; i++) {
    const dir = i % 4;
    let cx: number, cy: number, r: number;

    if (dir === 0) {
      r = h; cx = x + w - h; cy = y + h;
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((-90 * Math.PI) / 180), cy + r * Math.sin((-90 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((-45 * Math.PI) / 180), cy + r * Math.sin((-45 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((0 * Math.PI) / 180), cy + r * Math.sin((0 * Math.PI) / 180))
      );
      showIfIntersects(arc, context, () => { arc.strokeColor = color; arc.strokeWidth = style.strokeWidth; arc.fillColor = null; });
      const newH = w - h; w = h; h = newH;
    } else if (dir === 1) {
      r = w; cx = x; cy = y + w;
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((0 * Math.PI) / 180), cy + r * Math.sin((0 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((45 * Math.PI) / 180), cy + r * Math.sin((45 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((90 * Math.PI) / 180), cy + r * Math.sin((90 * Math.PI) / 180))
      );
      showIfIntersects(arc, context, () => { arc.strokeColor = color; arc.strokeWidth = style.strokeWidth; arc.fillColor = null; });
      const newW = h - w; y = y + w; h = w; w = newW;
    } else if (dir === 2) {
      r = h; cx = x + h; cy = y;
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((90 * Math.PI) / 180), cy + r * Math.sin((90 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((135 * Math.PI) / 180), cy + r * Math.sin((135 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((180 * Math.PI) / 180), cy + r * Math.sin((180 * Math.PI) / 180))
      );
      showIfIntersects(arc, context, () => { arc.strokeColor = color; arc.strokeWidth = style.strokeWidth; arc.fillColor = null; });
      const newH = w - h; x = x + h; w = h; h = newH;
    } else {
      r = w; cx = x + w; cy = y + h - w;
      const arc = new paper.Path.Arc(
        new paper.Point(cx + r * Math.cos((180 * Math.PI) / 180), cy + r * Math.sin((180 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((225 * Math.PI) / 180), cy + r * Math.sin((225 * Math.PI) / 180)),
        new paper.Point(cx + r * Math.cos((270 * Math.PI) / 180), cy + r * Math.sin((270 * Math.PI) / 180))
      );
      showIfIntersects(arc, context, () => { arc.strokeColor = color; arc.strokeWidth = style.strokeWidth; arc.fillColor = null; });
      const newW = h - w; y = y + h - w; h = w; w = newW;
    }

    if (w < 1 || h < 1) break;
  }
}

export function renderThirdLines(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const color = hexToColor(style.color, style.opacity);
  const dotColor = hexToColor(style.color, style.opacity * 0.8);

  const shownVLines: number[] = [];
  const shownHLines: number[] = [];

  for (let i = 1; i <= 2; i++) {
    const x = bounds.left + (bounds.width * i) / 3;
    const line = new paper.Path.Line(new paper.Point(x, bounds.top - 20), new paper.Point(x, bounds.bottom + 20));
    showIfIntersects(line, context, () => {
      line.strokeColor = color; line.strokeWidth = style.strokeWidth; line.dashArray = [6, 4];
      shownVLines.push(x);
    });

    const y = bounds.top + (bounds.height * i) / 3;
    const hLine = new paper.Path.Line(new paper.Point(bounds.left - 20, y), new paper.Point(bounds.right + 20, y));
    showIfIntersects(hLine, context, () => {
      hLine.strokeColor = color; hLine.strokeWidth = style.strokeWidth; hLine.dashArray = [6, 4];
      shownHLines.push(y);
    });
  }

  for (const x of (shownVLines.length ? shownVLines : [bounds.left + bounds.width / 3, bounds.left + (bounds.width * 2) / 3])) {
    for (const y of (shownHLines.length ? shownHLines : [bounds.top + bounds.height / 3, bounds.top + (bounds.height * 2) / 3])) {
      if (context?.useRealData && (!shownVLines.length || !shownHLines.length)) continue;
      const dot = new paper.Path.Circle(new paper.Point(x, y), style.strokeWidth * 2 + 1);
      dot.fillColor = dotColor; dot.strokeColor = null;
    }
  }
}

export function renderTypographicProportions(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
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
    const line = new paper.Path.Line(new paper.Point(bounds.left - 60, y), new paper.Point(bounds.right + 30, y));
    showIfIntersects(line, context, () => {
      line.strokeColor = color; line.strokeWidth = style.strokeWidth; line.dashArray = [6, 3];
      const label = new paper.PointText(new paper.Point(bounds.left - 65, y + 3));
      label.content = g.name; label.fillColor = labelColor; label.fontSize = 8; label.justification = 'right';
    });
  });
}

export function renderRuleOfOdds(
  bounds: paper.Rectangle,
  style: StyleConfig,
  context?: RenderContext
) {
  const color = hexToColor(style.color, style.opacity);
  const labelColor = hexToColor(style.color, style.opacity * 0.6);

  for (let i = 1; i < 5; i++) {
    const x = bounds.left + (bounds.width * i) / 5;
    const line = new paper.Path.Line(new paper.Point(x, bounds.top - 15), new paper.Point(x, bounds.bottom + 15));
    showIfIntersects(line, context, () => { line.strokeColor = color; line.strokeWidth = style.strokeWidth; line.dashArray = [6, 3]; });

    const y = bounds.top + (bounds.height * i) / 5;
    const hLine = new paper.Path.Line(new paper.Point(bounds.left - 15, y), new paper.Point(bounds.right + 15, y));
    showIfIntersects(hLine, context, () => { hLine.strokeColor = color; hLine.strokeWidth = style.strokeWidth; hLine.dashArray = [6, 3]; });
  }

  const dimColor = hexToColor(style.color, style.opacity * 0.4);
  for (let i = 1; i < 7; i++) {
    const x = bounds.left + (bounds.width * i) / 7;
    const line = new paper.Path.Line(new paper.Point(x, bounds.top - 8), new paper.Point(x, bounds.bottom + 8));
    showIfIntersects(line, context, () => { line.strokeColor = dimColor; line.strokeWidth = style.strokeWidth * 0.5; line.dashArray = [2, 4]; });

    const y = bounds.top + (bounds.height * i) / 7;
    const hLine = new paper.Path.Line(new paper.Point(bounds.left - 8, y), new paper.Point(bounds.right + 8, y));
    showIfIntersects(hLine, context, () => { hLine.strokeColor = dimColor; hLine.strokeWidth = style.strokeWidth * 0.5; hLine.dashArray = [2, 4]; });
  }

  const l5 = new paper.PointText(new paper.Point(bounds.right + 18, bounds.top + bounds.height / 5 + 3));
  l5.content = '1/5'; l5.fillColor = labelColor; l5.fontSize = 7;
  const l7 = new paper.PointText(new paper.Point(bounds.right + 18, bounds.top + bounds.height / 7 + 3));
  l7.content = '1/7'; l7.fillColor = hexToColor(style.color, style.opacity * 0.35); l7.fontSize = 7;
}
