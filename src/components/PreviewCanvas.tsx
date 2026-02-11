import React, { useRef, useEffect, useCallback, useState } from 'react';
import paper from 'paper';
import { type ParsedSVG, type ClearspaceUnit, computeClearspace, getLogomarkSize, generateGridLines } from '@/lib/svg-engine';

interface PreviewCanvasProps {
  parsedSVG: ParsedSVG | null;
  clearspaceValue: number;
  clearspaceUnit: ClearspaceUnit;
  showGrid: boolean;
  gridSubdivisions: number;
  onProjectReady?: (project: paper.Project) => void;
}

const CANVAS_PADDING = 60;

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  parsedSVG,
  clearspaceValue,
  clearspaceUnit,
  showGrid,
  gridSubdivisions,
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

    // Size canvas to container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    paper.setup(canvas);

    // Import SVG fresh
    const item = paper.project.importSVG(parsedSVG.originalSVG, { expandShapes: true });

    // Scale to fit canvas with padding
    const availW = canvas.width - CANVAS_PADDING * 2;
    const availH = canvas.height - CANVAS_PADDING * 2;
    const scale = Math.min(availW / item.bounds.width, availH / item.bounds.height) * zoom;

    item.scale(scale);
    item.position = new paper.Point(canvas.width / 2, canvas.height / 2);

    const bounds = item.bounds;

    // Collect components for grid/clearspace
    const components = parsedSVG.components;
    const logomarkSize = getLogomarkSize(components) * scale;

    // Draw clearspace zones
    if (clearspaceValue > 0) {
      const zones = computeClearspace(bounds, clearspaceValue, clearspaceUnit, logomarkSize);

      const clearspaceColor = new paper.Color(0.37, 0.67, 0.97, 0.12);
      const borderColor = new paper.Color(0.37, 0.67, 0.97, 0.5);

      // Top zone
      const top = new paper.Path.Rectangle(
        new paper.Point(bounds.left - zones.left, bounds.top - zones.top),
        new paper.Point(bounds.right + zones.right, bounds.top)
      );
      top.fillColor = clearspaceColor;
      top.strokeColor = borderColor;
      top.strokeWidth = 1;

      // Bottom zone
      const bottom = new paper.Path.Rectangle(
        new paper.Point(bounds.left - zones.left, bounds.bottom),
        new paper.Point(bounds.right + zones.right, bounds.bottom + zones.bottom)
      );
      bottom.fillColor = clearspaceColor;
      bottom.strokeColor = borderColor;
      bottom.strokeWidth = 1;

      // Left zone
      const left = new paper.Path.Rectangle(
        new paper.Point(bounds.left - zones.left, bounds.top),
        new paper.Point(bounds.left, bounds.bottom)
      );
      left.fillColor = clearspaceColor;
      left.strokeColor = borderColor;
      left.strokeWidth = 1;

      // Right zone
      const right = new paper.Path.Rectangle(
        new paper.Point(bounds.right, bounds.top),
        new paper.Point(bounds.right + zones.right, bounds.bottom)
      );
      right.fillColor = clearspaceColor;
      right.strokeColor = borderColor;
      right.strokeWidth = 1;

      // Draw 'X' labels
      const labelColor = new paper.Color(0.37, 0.67, 0.97, 0.8);

      // Top X label
      if (zones.top > 15) {
        const xText = new paper.PointText(new paper.Point(bounds.center.x, bounds.top - zones.top / 2 + 4));
        xText.content = 'X';
        xText.fillColor = labelColor;
        xText.fontSize = 11;
        xText.fontWeight = 'bold';
        xText.justification = 'center';
      }
    }

    // Draw grid
    if (showGrid) {
      // Scale component bounds
      const scaledComponents = components.map(c => ({
        ...c,
        bounds: new paper.Rectangle(
          bounds.left + (c.bounds.left - parsedSVG.fullBounds.left) / parsedSVG.fullBounds.width * bounds.width,
          bounds.top + (c.bounds.top - parsedSVG.fullBounds.top) / parsedSVG.fullBounds.height * bounds.height,
          c.bounds.width / parsedSVG.fullBounds.width * bounds.width,
          c.bounds.height / parsedSVG.fullBounds.height * bounds.height,
        ),
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

    (paper.view as any).draw();
    onProjectReady?.(paper.project);
  }, [parsedSVG, clearspaceValue, clearspaceUnit, showGrid, gridSubdivisions, zoom, onProjectReady]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Resize observer
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
      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-surface/80 backdrop-blur-sm rounded px-2 py-1">
        <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};

export default PreviewCanvas;
