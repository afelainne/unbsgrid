import React, { useRef, useEffect, useCallback, useState } from 'react';
import paper from 'paper';
import { type ParsedSVG, type ClearspaceUnit, computeClearspace, getLogomarkSize, generateGridLines } from '@/lib/svg-engine';
import type { GeometryOptions } from '@/pages/Index';

interface PreviewCanvasProps {
  parsedSVG: ParsedSVG | null;
  clearspaceValue: number;
  clearspaceUnit: ClearspaceUnit;
  showGrid: boolean;
  gridSubdivisions: number;
  geometryOptions: GeometryOptions;
  onProjectReady?: (project: paper.Project) => void;
}

const CANVAS_PADDING = 60;
const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  parsedSVG,
  clearspaceValue,
  clearspaceUnit,
  showGrid,
  gridSubdivisions,
  geometryOptions,
  onProjectReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const draw = useCallback(() => {
    if (!canvasRef.current || !parsedSVG) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    paper.setup(canvas);

    const item = paper.project.importSVG(parsedSVG.originalSVG, { expandShapes: true });

    const availW = canvas.width - CANVAS_PADDING * 2;
    const availH = canvas.height - CANVAS_PADDING * 2;
    const scale = Math.min(availW / item.bounds.width, availH / item.bounds.height) * zoom;

    item.scale(scale);
    item.position = new paper.Point(canvas.width / 2, canvas.height / 2);

    const bounds = item.bounds;
    const components = parsedSVG.components;
    const logomarkSize = getLogomarkSize(components) * scale;

    // Scale component bounds to canvas coordinates
    const scaledCompBounds = components.map(c => new paper.Rectangle(
      bounds.left + (c.bounds.left - parsedSVG.fullBounds.left) / parsedSVG.fullBounds.width * bounds.width,
      bounds.top + (c.bounds.top - parsedSVG.fullBounds.top) / parsedSVG.fullBounds.height * bounds.height,
      c.bounds.width / parsedSVG.fullBounds.width * bounds.width,
      c.bounds.height / parsedSVG.fullBounds.height * bounds.height,
    ));

    // --- Clearspace zones ---
    if (clearspaceValue > 0) {
      const zones = computeClearspace(bounds, clearspaceValue, clearspaceUnit, logomarkSize);
      const clearspaceColor = new paper.Color(0.37, 0.67, 0.97, 0.12);
      const borderColor = new paper.Color(0.37, 0.67, 0.97, 0.5);

      const top = new paper.Path.Rectangle(
        new paper.Point(bounds.left - zones.left, bounds.top - zones.top),
        new paper.Point(bounds.right + zones.right, bounds.top)
      );
      top.fillColor = clearspaceColor;
      top.strokeColor = borderColor;
      top.strokeWidth = 1;

      const bottom = new paper.Path.Rectangle(
        new paper.Point(bounds.left - zones.left, bounds.bottom),
        new paper.Point(bounds.right + zones.right, bounds.bottom + zones.bottom)
      );
      bottom.fillColor = clearspaceColor;
      bottom.strokeColor = borderColor;
      bottom.strokeWidth = 1;

      const left = new paper.Path.Rectangle(
        new paper.Point(bounds.left - zones.left, bounds.top),
        new paper.Point(bounds.left, bounds.bottom)
      );
      left.fillColor = clearspaceColor;
      left.strokeColor = borderColor;
      left.strokeWidth = 1;

      const right = new paper.Path.Rectangle(
        new paper.Point(bounds.right, bounds.top),
        new paper.Point(bounds.right + zones.right, bounds.bottom)
      );
      right.fillColor = clearspaceColor;
      right.strokeColor = borderColor;
      right.strokeWidth = 1;

      const labelColor = new paper.Color(0.37, 0.67, 0.97, 0.8);
      if (zones.top > 15) {
        const xText = new paper.PointText(new paper.Point(bounds.center.x, bounds.top - zones.top / 2 + 4));
        xText.content = 'X';
        xText.fillColor = labelColor;
        xText.fontSize = 11;
        xText.fontWeight = 'bold';
        xText.justification = 'center';
      }
    }

    // --- Construction Grid ---
    if (showGrid) {
      const scaledComponents = components.map((c, i) => ({
        ...c,
        bounds: scaledCompBounds[i],
      }));

      const gridData = generateGridLines(bounds, scaledComponents as any, gridSubdivisions);
      const gridColor = new paper.Color(0.37, 0.67, 0.97, 0.25);

      gridData.vertical.forEach(x => {
        if (x >= bounds.left - 200 && x <= bounds.right + 200) {
          const line = new paper.Path.Line(
            new paper.Point(x, bounds.top - 50),
            new paper.Point(x, bounds.bottom + 50)
          );
          line.strokeColor = gridColor;
          line.strokeWidth = 0.5;
        }
      });

      gridData.horizontal.forEach(y => {
        if (y >= bounds.top - 200 && y <= bounds.bottom + 200) {
          const line = new paper.Path.Line(
            new paper.Point(bounds.left - 50, y),
            new paper.Point(bounds.right + 50, y)
          );
          line.strokeColor = gridColor;
          line.strokeWidth = 0.5;
        }
      });
    }

    // --- Construction Geometry ---

    // Bounding Rectangles per component
    if (geometryOptions.boundingRects) {
      const rectColor = new paper.Color(0.85, 0.25, 0.25, 0.6);
      scaledCompBounds.forEach(cb => {
        const rect = new paper.Path.Rectangle(cb);
        rect.strokeColor = rectColor;
        rect.strokeWidth = 1;
        rect.fillColor = null;
        rect.dashArray = [4, 3];
      });
      // Full bounding rect
      const fullRect = new paper.Path.Rectangle(bounds);
      fullRect.strokeColor = new paper.Color(0.85, 0.25, 0.25, 0.4);
      fullRect.strokeWidth = 1.5;
      fullRect.fillColor = null;
    }

    // Inscribed / Circumscribed Circles per component
    if (geometryOptions.circles) {
      const circColor = new paper.Color(0.2, 0.7, 0.5, 0.5);
      scaledCompBounds.forEach(cb => {
        const cx = cb.center.x;
        const cy = cb.center.y;
        // Inscribed circle (fits inside)
        const inscribedR = Math.min(cb.width, cb.height) / 2;
        const inscribed = new paper.Path.Circle(new paper.Point(cx, cy), inscribedR);
        inscribed.strokeColor = circColor;
        inscribed.strokeWidth = 1;
        inscribed.fillColor = null;

        // Circumscribed circle (wraps outside)
        const circumR = Math.sqrt(cb.width * cb.width + cb.height * cb.height) / 2;
        const circum = new paper.Path.Circle(new paper.Point(cx, cy), circumR);
        circum.strokeColor = new paper.Color(0.2, 0.7, 0.5, 0.3);
        circum.strokeWidth = 1;
        circum.fillColor = null;
        circum.dashArray = [6, 4];
      });
    }

    // Center / Axis Lines
    if (geometryOptions.centerLines) {
      const axisColor = new paper.Color(0.9, 0.6, 0.1, 0.5);
      // Horizontal center
      const hLine = new paper.Path.Line(
        new paper.Point(bounds.left - 30, bounds.center.y),
        new paper.Point(bounds.right + 30, bounds.center.y)
      );
      hLine.strokeColor = axisColor;
      hLine.strokeWidth = 1;
      hLine.dashArray = [8, 4];

      // Vertical center
      const vLine = new paper.Path.Line(
        new paper.Point(bounds.center.x, bounds.top - 30),
        new paper.Point(bounds.center.x, bounds.bottom + 30)
      );
      vLine.strokeColor = axisColor;
      vLine.strokeWidth = 1;
      vLine.dashArray = [8, 4];

      // Per-component centers
      scaledCompBounds.forEach(cb => {
        if (Math.abs(cb.center.x - bounds.center.x) > 2 || Math.abs(cb.center.y - bounds.center.y) > 2) {
          const ch = new paper.Path.Line(
            new paper.Point(cb.left - 10, cb.center.y),
            new paper.Point(cb.right + 10, cb.center.y)
          );
          ch.strokeColor = new paper.Color(0.9, 0.6, 0.1, 0.3);
          ch.strokeWidth = 0.5;
          ch.dashArray = [4, 3];

          const cv = new paper.Path.Line(
            new paper.Point(cb.center.x, cb.top - 10),
            new paper.Point(cb.center.x, cb.bottom + 10)
          );
          cv.strokeColor = new paper.Color(0.9, 0.6, 0.1, 0.3);
          cv.strokeWidth = 0.5;
          cv.dashArray = [4, 3];
        }
      });
    }

    // Diagonal Lines
    if (geometryOptions.diagonals) {
      const diagColor = new paper.Color(0.7, 0.3, 0.8, 0.4);
      // Main diagonals
      const d1 = new paper.Path.Line(
        new paper.Point(bounds.left, bounds.top),
        new paper.Point(bounds.right, bounds.bottom)
      );
      d1.strokeColor = diagColor;
      d1.strokeWidth = 1;

      const d2 = new paper.Path.Line(
        new paper.Point(bounds.right, bounds.top),
        new paper.Point(bounds.left, bounds.bottom)
      );
      d2.strokeColor = diagColor;
      d2.strokeWidth = 1;

      // Per-component diagonals
      scaledCompBounds.forEach(cb => {
        const cd1 = new paper.Path.Line(
          new paper.Point(cb.left, cb.top),
          new paper.Point(cb.right, cb.bottom)
        );
        cd1.strokeColor = new paper.Color(0.7, 0.3, 0.8, 0.25);
        cd1.strokeWidth = 0.5;

        const cd2 = new paper.Path.Line(
          new paper.Point(cb.right, cb.top),
          new paper.Point(cb.left, cb.bottom)
        );
        cd2.strokeColor = new paper.Color(0.7, 0.3, 0.8, 0.25);
        cd2.strokeWidth = 0.5;
      });
    }

    // Golden Ratio Circles
    if (geometryOptions.goldenRatio) {
      const grColor = new paper.Color(0.95, 0.75, 0.1, 0.45);
      const cx = bounds.center.x;
      const cy = bounds.center.y;
      const baseRadius = Math.min(bounds.width, bounds.height) / 2;

      // Fibonacci-scaled circles: 1, 1, 2, 3, 5, 8, 13
      const fibSequence = [1, 1, 2, 3, 5, 8, 13];
      const maxFib = fibSequence[fibSequence.length - 1];

      fibSequence.forEach(fib => {
        const r = (fib / maxFib) * baseRadius;
        const circle = new paper.Path.Circle(new paper.Point(cx, cy), r);
        circle.strokeColor = grColor;
        circle.strokeWidth = 1;
        circle.fillColor = null;

        // Label
        if (r > 12) {
          const label = new paper.PointText(new paper.Point(cx + r + 4, cy - 2));
          label.content = String(fib);
          label.fillColor = new paper.Color(0.95, 0.75, 0.1, 0.7);
          label.fontSize = 9;
          label.fontWeight = 'bold';
        }
      });

      // Golden rectangle
      const grWidth = bounds.width;
      const grHeight = grWidth / PHI;
      const grRect = new paper.Path.Rectangle(
        new paper.Point(cx - grWidth / 2, cy - grHeight / 2),
        new paper.Point(cx + grWidth / 2, cy + grHeight / 2)
      );
      grRect.strokeColor = new paper.Color(0.95, 0.75, 0.1, 0.3);
      grRect.strokeWidth = 1;
      grRect.fillColor = null;
      grRect.dashArray = [6, 4];
    }

    // Tangent Lines (lines along component edges extended)
    if (geometryOptions.tangentLines) {
      const tangentColor = new paper.Color(0.4, 0.8, 0.9, 0.35);
      scaledCompBounds.forEach(cb => {
        // Top edge extended
        const tTop = new paper.Path.Line(
          new paper.Point(bounds.left - 40, cb.top),
          new paper.Point(bounds.right + 40, cb.top)
        );
        tTop.strokeColor = tangentColor;
        tTop.strokeWidth = 0.5;
        tTop.dashArray = [2, 3];

        // Bottom edge
        const tBottom = new paper.Path.Line(
          new paper.Point(bounds.left - 40, cb.bottom),
          new paper.Point(bounds.right + 40, cb.bottom)
        );
        tBottom.strokeColor = tangentColor;
        tBottom.strokeWidth = 0.5;
        tBottom.dashArray = [2, 3];

        // Left edge
        const tLeft = new paper.Path.Line(
          new paper.Point(cb.left, bounds.top - 40),
          new paper.Point(cb.left, bounds.bottom + 40)
        );
        tLeft.strokeColor = tangentColor;
        tLeft.strokeWidth = 0.5;
        tLeft.dashArray = [2, 3];

        // Right edge
        const tRight = new paper.Path.Line(
          new paper.Point(cb.right, bounds.top - 40),
          new paper.Point(cb.right, bounds.bottom + 40)
        );
        tRight.strokeColor = tangentColor;
        tRight.strokeWidth = 0.5;
        tRight.dashArray = [2, 3];
      });
    }

    (paper.view as any).draw();
    onProjectReady?.(paper.project);
  }, [parsedSVG, clearspaceValue, clearspaceUnit, showGrid, gridSubdivisions, geometryOptions, zoom, onProjectReady]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.1, Math.min(5, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-canvas rounded-lg overflow-hidden" onWheel={handleWheel}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {!parsedSVG && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Upload an SVG to get started</p>
        </div>
      )}
      <div className="absolute bottom-3 right-3 bg-surface/80 backdrop-blur-sm rounded px-2 py-1">
        <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};

export default PreviewCanvas;
