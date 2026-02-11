import paper from 'paper';

export interface SVGComponent {
  id: string;
  path: paper.Path | paper.CompoundPath;
  bounds: paper.Rectangle;
  isIcon: boolean;
}

export interface BezierSegmentData {
  anchor: { x: number; y: number };
  handleIn: { x: number; y: number };
  handleOut: { x: number; y: number };
  hasHandleIn: boolean;
  hasHandleOut: boolean;
}

export interface ParsedSVG {
  components: SVGComponent[];
  fullBounds: paper.Rectangle;
  originalSVG: string;
  paperProject: paper.Project;
  segments: BezierSegmentData[];
}

export type ClearspaceUnit = 'logomark' | 'pixels' | 'centimeters' | 'inches';

const UNIT_TO_PX: Record<ClearspaceUnit, number> = {
  logomark: 1,
  pixels: 1,
  centimeters: 28.346,
  inches: 72,
};

export function convertToPixels(value: number, unit: ClearspaceUnit, logomarkSize: number): number {
  if (unit === 'logomark') {
    return value * logomarkSize;
  }
  return value * UNIT_TO_PX[unit];
}

export function extractBezierHandles(item: paper.Item): BezierSegmentData[] {
  const results: BezierSegmentData[] = [];

  function walk(it: paper.Item) {
    if (it instanceof paper.Path && it.segments) {
      for (const seg of it.segments) {
        const anchor = seg.point;
        const hIn = seg.handleIn;
        const hOut = seg.handleOut;
        results.push({
          anchor: { x: anchor.x, y: anchor.y },
          handleIn: { x: anchor.x + hIn.x, y: anchor.y + hIn.y },
          handleOut: { x: anchor.x + hOut.x, y: anchor.y + hOut.y },
          hasHandleIn: hIn.length > 0.5,
          hasHandleOut: hOut.length > 0.5,
        });
      }
    }
    if (it instanceof paper.CompoundPath && it.children) {
      for (const child of it.children) {
        walk(child);
      }
    }
    if (it.children && !(it instanceof paper.CompoundPath)) {
      for (const child of it.children) {
        walk(child);
      }
    }
  }

  walk(item);
  return results;
}

export function parseSVG(svgString: string, canvas: HTMLCanvasElement): ParsedSVG {
  paper.setup(canvas);
  
  const item = paper.project.importSVG(svgString, { expandShapes: true });
  
  const components: SVGComponent[] = [];
  let idx = 0;
  
  function collectPaths(item: paper.Item) {
    if (item instanceof paper.Path || item instanceof paper.CompoundPath) {
      if (item.bounds.width > 0 && item.bounds.height > 0) {
        components.push({
          id: `comp-${idx++}`,
          path: item,
          bounds: item.bounds,
          isIcon: false,
        });
      }
    }
    if (item.children) {
      for (const child of item.children) {
        collectPaths(child);
      }
    }
  }
  
  collectPaths(item);
  
  if (components.length > 1) {
    let bestIconIdx = 0;
    let bestRatio = Infinity;
    components.forEach((comp, i) => {
      const ratio = Math.abs(comp.bounds.width / comp.bounds.height - 1);
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestIconIdx = i;
      }
    });
    components[bestIconIdx].isIcon = true;
  } else if (components.length === 1) {
    components[0].isIcon = true;
  }
  
  const fullBounds = item.bounds;
  const segments = extractBezierHandles(item);
  
  return {
    components,
    fullBounds,
    originalSVG: svgString,
    paperProject: paper.project,
    segments,
  };
}

export function getLogomarkSize(components: SVGComponent[]): number {
  const icon = components.find(c => c.isIcon);
  if (!icon) return 50;
  return Math.min(icon.bounds.width, icon.bounds.height);
}

export function invertComponents(components: SVGComponent[]): SVGComponent[] {
  return components.map(c => ({ ...c, isIcon: !c.isIcon }));
}

export interface ClearspaceZones {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function computeClearspace(
  bounds: paper.Rectangle,
  value: number,
  unit: ClearspaceUnit,
  logomarkSize: number
): ClearspaceZones {
  const px = convertToPixels(value, unit, logomarkSize);
  return { top: px, bottom: px, left: px, right: px };
}

export function generateGridLines(
  bounds: paper.Rectangle,
  components: SVGComponent[],
  subdivisions: number = 8
): { horizontal: number[]; vertical: number[] } {
  const icon = components.find(c => c.isIcon);
  const ref = icon ? icon.bounds : bounds;
  
  const horizontal: number[] = [];
  const vertical: number[] = [];
  
  const stepX = ref.width / subdivisions;
  const stepY = ref.height / subdivisions;
  
  const startX = ref.left;
  const startY = ref.top;
  
  for (let x = startX; x <= bounds.right + stepX; x += stepX) {
    vertical.push(x);
  }
  for (let x = startX - stepX; x >= bounds.left - stepX; x -= stepX) {
    vertical.unshift(x);
  }
  for (let y = startY; y <= bounds.bottom + stepY; y += stepY) {
    horizontal.push(y);
  }
  for (let y = startY - stepY; y >= bounds.top - stepY; y -= stepY) {
    horizontal.unshift(y);
  }
  
  return { horizontal, vertical };
}

export function exportSVG(project: paper.Project): string {
  const svg = project.exportSVG({ asString: true }) as string;
  return svg;
}
