import type { GeometryOptions, GeometryStyles } from '@/pages/Index';
import type { ClearspaceUnit } from '@/lib/svg-engine';

export interface GeometryPreset {
  id: string;
  name: string;
  description?: string;
  isBuiltin?: boolean;
  geometryOptions: GeometryOptions;
  geometryStyles: GeometryStyles;
  clearspaceValue: number;
  clearspaceUnit: ClearspaceUnit;
  showGrid: boolean;
  gridSubdivisions: number;
  createdAt: number;
}

const STORAGE_KEY = 'unbsgrid-presets';

const allOff: GeometryOptions = {
  boundingRects: false, circles: false, diagonals: false, goldenRatio: false,
  centerLines: false, tangentLines: false, goldenSpiral: false, isometricGrid: false,
  bezierHandles: false, typographicProportions: false, thirdLines: false,
  symmetryAxes: false, angleMeasurements: false, spacingGuides: false,
  rootRectangles: false, modularScale: false, alignmentGuides: false, safeZone: false,
  pixelGrid: false, opticalCenter: false, contrastGuide: false,
};

const defaultStyle = (color: string, opacity: number, strokeWidth: number) => ({ color, opacity, strokeWidth });

const defaultStyles: GeometryStyles = {
  boundingRects:          defaultStyle('#d94040', 0.6, 1),
  circles:                defaultStyle('#33b380', 0.5, 1),
  centerLines:            defaultStyle('#e69a1a', 0.5, 1),
  diagonals:              defaultStyle('#b34dd6', 0.4, 1),
  goldenRatio:            defaultStyle('#f2c00a', 0.45, 1),
  tangentLines:           defaultStyle('#66ccdd', 0.35, 0.5),
  goldenSpiral:           defaultStyle('#ff8c42', 0.5, 1.5),
  isometricGrid:          defaultStyle('#5eaaf7', 0.3, 0.5),
  bezierHandles:          defaultStyle('#ff5577', 0.6, 1),
  typographicProportions: defaultStyle('#88ddaa', 0.5, 1),
  thirdLines:             defaultStyle('#aa88ff', 0.4, 1),
  symmetryAxes:           defaultStyle('#ff66b2', 0.5, 1),
  angleMeasurements:      defaultStyle('#ffaa33', 0.55, 1),
  spacingGuides:          defaultStyle('#33ccff', 0.5, 1),
  rootRectangles:         defaultStyle('#cc77ff', 0.45, 1),
  modularScale:           defaultStyle('#77ddaa', 0.4, 1),
  alignmentGuides:        defaultStyle('#ff7744', 0.4, 0.8),
  safeZone:               defaultStyle('#44cc88', 0.35, 1.2),
  pixelGrid:              defaultStyle('#999999', 0.2, 0.5),
  opticalCenter:          defaultStyle('#ff4488', 0.6, 1.5),
  contrastGuide:          defaultStyle('#ffcc00', 0.4, 1),
};

export function getBuiltinPresets(): GeometryPreset[] {
  return [
    {
      id: 'builtin-minimalist',
      name: 'Minimalista',
      description: 'Apenas bounding rects e center lines',
      isBuiltin: true,
      geometryOptions: { ...allOff, boundingRects: true, centerLines: true },
      geometryStyles: { ...defaultStyles },
      clearspaceValue: 1, clearspaceUnit: 'logomark', showGrid: false, gridSubdivisions: 8,
      createdAt: 0,
    },
    {
      id: 'builtin-golden',
      name: 'Proporções Áureas',
      description: 'Golden ratio, spiral e rule of thirds',
      isBuiltin: true,
      geometryOptions: { ...allOff, goldenRatio: true, goldenSpiral: true, thirdLines: true, typographicProportions: true },
      geometryStyles: { ...defaultStyles },
      clearspaceValue: 1, clearspaceUnit: 'logomark', showGrid: false, gridSubdivisions: 8,
      createdAt: 0,
    },
    {
      id: 'builtin-full',
      name: 'Análise Completa',
      description: 'Todos os tipos de geometria ativados',
      isBuiltin: true,
      geometryOptions: {
        boundingRects: true, circles: true, diagonals: true, goldenRatio: true,
        centerLines: true, tangentLines: true, goldenSpiral: true, isometricGrid: true,
        bezierHandles: true, typographicProportions: true, thirdLines: true,
        symmetryAxes: true, angleMeasurements: true, spacingGuides: true,
        rootRectangles: true, modularScale: true, alignmentGuides: true, safeZone: true,
        pixelGrid: true, opticalCenter: true, contrastGuide: true,
      },
      geometryStyles: { ...defaultStyles },
      clearspaceValue: 1, clearspaceUnit: 'logomark', showGrid: true, gridSubdivisions: 8,
      createdAt: 0,
    },
    {
      id: 'builtin-technical',
      name: 'Construção Técnica',
      description: 'Bezier handles, isometric grid e análise estrutural',
      isBuiltin: true,
      geometryOptions: { ...allOff, bezierHandles: true, isometricGrid: true, centerLines: true, boundingRects: true },
      geometryStyles: { ...defaultStyles },
      clearspaceValue: 1, clearspaceUnit: 'logomark', showGrid: true, gridSubdivisions: 8,
      createdAt: 0,
    },
  ];
}

export function loadPresetsFromStorage(): GeometryPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(validatePreset);
  } catch {
    return [];
  }
}

export function savePresetsToStorage(presets: GeometryPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.filter(p => !p.isBuiltin)));
}

export function createPreset(config: Omit<GeometryPreset, 'id' | 'createdAt' | 'isBuiltin'>): GeometryPreset {
  return {
    ...config,
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  };
}

function validatePreset(p: any): p is GeometryPreset {
  return p && typeof p.id === 'string' && typeof p.name === 'string' && p.geometryOptions && p.geometryStyles;
}
