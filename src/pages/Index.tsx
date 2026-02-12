import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import paper from 'paper';
import { Download, Grid3X3, Shield, Layers, ChevronDown, ChevronRight, Ruler, Hexagon, Palette, RotateCcw } from 'lucide-react';
import SVGDropZone from '@/components/SVGDropZone';
import PreviewCanvas from '@/components/PreviewCanvas';
import UnitSelector from '@/components/UnitSelector';
import InfoTooltip from '@/components/InfoTooltip';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseSVG, invertComponents, exportSVG, type ParsedSVG, type ClearspaceUnit } from '@/lib/svg-engine';
import { getBuiltinPresets, loadPresetsFromStorage, savePresetsToStorage, createPreset, type GeometryPreset } from '@/lib/preset-engine';
import PresetManager from '@/components/PresetManager';
import SavePresetDialog from '@/components/SavePresetDialog';
import LoadPresetDialog from '@/components/LoadPresetDialog';

export interface GeometryOptions {
  boundingRects: boolean;
  circles: boolean;
  diagonals: boolean;
  goldenRatio: boolean;
  centerLines: boolean;
  tangentLines: boolean;
  goldenSpiral: boolean;
  isometricGrid: boolean;
  bezierHandles: boolean;
  typographicProportions: boolean;
  thirdLines: boolean;
  symmetryAxes: boolean;
  angleMeasurements: boolean;
  spacingGuides: boolean;
  rootRectangles: boolean;
  modularScale: boolean;
  alignmentGuides: boolean;
  safeZone: boolean;
  pixelGrid: boolean;
  opticalCenter: boolean;
  contrastGuide: boolean;
  dynamicBaseline: boolean;
  fibonacciOverlay: boolean;
  kenBurnsSafe: boolean;
  componentRatioLabels: boolean;
  // Batch 3
  vesicaPiscis: boolean;
  ruleOfOdds: boolean;
  visualWeightMap: boolean;
  anchoringPoints: boolean;
  harmonicDivisions: boolean;
}

export interface GeometryStyle {
  color: string;
  opacity: number;
  strokeWidth: number;
}

export type GeometryStyles = Record<keyof GeometryOptions, GeometryStyle>;

export type CanvasBackground = 'dark' | 'light' | 'checkerboard';

const defaultStyles: GeometryStyles = {
  boundingRects:          { color: '#d94040', opacity: 0.6, strokeWidth: 1 },
  circles:                { color: '#33b380', opacity: 0.5, strokeWidth: 1 },
  centerLines:            { color: '#e69a1a', opacity: 0.5, strokeWidth: 1 },
  diagonals:              { color: '#b34dd6', opacity: 0.4, strokeWidth: 1 },
  goldenRatio:            { color: '#f2c00a', opacity: 0.45, strokeWidth: 1 },
  tangentLines:           { color: '#66ccdd', opacity: 0.35, strokeWidth: 0.5 },
  goldenSpiral:           { color: '#ff8c42', opacity: 0.5, strokeWidth: 1.5 },
  isometricGrid:          { color: '#5eaaf7', opacity: 0.3, strokeWidth: 0.5 },
  bezierHandles:          { color: '#ff5577', opacity: 0.6, strokeWidth: 1 },
  typographicProportions: { color: '#88ddaa', opacity: 0.5, strokeWidth: 1 },
  thirdLines:             { color: '#aa88ff', opacity: 0.4, strokeWidth: 1 },
  symmetryAxes:           { color: '#ff66b2', opacity: 0.5, strokeWidth: 1 },
  angleMeasurements:      { color: '#ffaa33', opacity: 0.55, strokeWidth: 1 },
  spacingGuides:          { color: '#33ccff', opacity: 0.5, strokeWidth: 1 },
  rootRectangles:         { color: '#cc77ff', opacity: 0.45, strokeWidth: 1 },
  modularScale:           { color: '#77ddaa', opacity: 0.4, strokeWidth: 1 },
  alignmentGuides:        { color: '#ff7744', opacity: 0.4, strokeWidth: 0.8 },
  safeZone:               { color: '#44cc88', opacity: 0.35, strokeWidth: 1.2 },
  pixelGrid:              { color: '#999999', opacity: 0.2, strokeWidth: 0.5 },
  opticalCenter:          { color: '#ff4488', opacity: 0.6, strokeWidth: 1.5 },
  contrastGuide:          { color: '#ffcc00', opacity: 0.4, strokeWidth: 1 },
  dynamicBaseline:        { color: '#66aadd', opacity: 0.4, strokeWidth: 0.8 },
  fibonacciOverlay:       { color: '#e6a833', opacity: 0.45, strokeWidth: 1 },
  kenBurnsSafe:           { color: '#ff6644', opacity: 0.35, strokeWidth: 1.2 },
  componentRatioLabels:   { color: '#88bbff', opacity: 0.7, strokeWidth: 1 },
  vesicaPiscis:           { color: '#bb77cc', opacity: 0.45, strokeWidth: 1 },
  ruleOfOdds:             { color: '#77aacc', opacity: 0.35, strokeWidth: 0.8 },
  visualWeightMap:        { color: '#cc8844', opacity: 0.3, strokeWidth: 1 },
  anchoringPoints:        { color: '#44ddbb', opacity: 0.6, strokeWidth: 1.5 },
  harmonicDivisions:      { color: '#aa66dd', opacity: 0.4, strokeWidth: 0.8 },
};

const geometryLabels: Record<keyof GeometryOptions, string> = {
  boundingRects: 'Bounding Rectangles',
  circles: 'Inscribed / Circumscribed Circles',
  centerLines: 'Center / Axis Lines',
  diagonals: 'Diagonal Lines',
  goldenRatio: 'Golden Ratio Circles',
  tangentLines: 'Tangent Lines',
  goldenSpiral: 'Golden Spiral',
  isometricGrid: 'Isometric Grid',
  bezierHandles: 'Bezier Handles',
  typographicProportions: 'Typographic Proportions',
  thirdLines: 'Rule of Thirds',
  symmetryAxes: 'Symmetry Axes',
  angleMeasurements: 'Angle Measurements',
  spacingGuides: 'Spacing Guides',
  rootRectangles: 'Root Rectangles (√2, √3, √5)',
  modularScale: 'Modular Scale',
  alignmentGuides: 'Alignment Guides',
  safeZone: 'Safe Zone',
  pixelGrid: 'Pixel Grid',
  opticalCenter: 'Optical Center',
  contrastGuide: 'Contrast Guide',
  dynamicBaseline: 'Dynamic Baseline Grid',
  fibonacciOverlay: 'Fibonacci Overlay',
  kenBurnsSafe: 'Ken Burns Safe Area',
  componentRatioLabels: 'Component Ratio Labels',
  vesicaPiscis: 'Vesica Piscis',
  ruleOfOdds: 'Rule of Odds (5ths & 7ths)',
  visualWeightMap: 'Visual Weight Map',
  anchoringPoints: 'Anchoring Points',
  harmonicDivisions: 'Harmonic Divisions',
};

const geometryGroups: { label: string; keys: (keyof GeometryOptions)[] }[] = [
  { label: 'Basic', keys: ['boundingRects', 'circles', 'centerLines', 'diagonals', 'tangentLines', 'anchoringPoints'] },
  { label: 'Proportions', keys: ['goldenRatio', 'goldenSpiral', 'thirdLines', 'typographicProportions', 'ruleOfOdds'] },
  { label: 'Measurement', keys: ['symmetryAxes', 'angleMeasurements', 'spacingGuides', 'alignmentGuides', 'dynamicBaseline', 'componentRatioLabels', 'harmonicDivisions'] },
  { label: 'Harmony', keys: ['rootRectangles', 'modularScale', 'safeZone', 'fibonacciOverlay', 'vesicaPiscis'] },
  { label: 'Advanced', keys: ['bezierHandles', 'isometricGrid', 'pixelGrid', 'opticalCenter', 'contrastGuide', 'kenBurnsSafe', 'visualWeightMap'] },
];

interface StyleControlProps {
  style: GeometryStyle;
  onChange: (s: GeometryStyle) => void;
}

const StyleControl: React.FC<StyleControlProps> = ({ style, onChange }) => (
  <div className="pl-7 pr-1 space-y-2 pb-2">
    <div className="flex items-center gap-2">
      <Label className="text-[10px] text-muted-foreground w-10">Color</Label>
      <input
        type="color"
        value={style.color}
        onChange={e => onChange({ ...style, color: e.target.value })}
        className="w-6 h-6 rounded border border-border bg-transparent cursor-pointer"
      />
    </div>
    <div className="flex items-center gap-2">
      <Label className="text-[10px] text-muted-foreground w-10">Opacity</Label>
      <Slider
        min={0} max={100} step={1}
        value={[Math.round(style.opacity * 100)]}
        onValueChange={v => onChange({ ...style, opacity: v[0] / 100 })}
        className="flex-1"
      />
      <span className="text-[9px] text-muted-foreground w-8 text-right">{Math.round(style.opacity * 100)}%</span>
    </div>
    <div className="flex items-center gap-2">
      <Label className="text-[10px] text-muted-foreground w-10">Stroke</Label>
      <Slider
        min={5} max={50} step={5}
        value={[Math.round(style.strokeWidth * 10)]}
        onValueChange={v => onChange({ ...style, strokeWidth: v[0] / 10 })}
        className="flex-1"
      />
      <span className="text-[9px] text-muted-foreground w-8 text-right">{style.strokeWidth.toFixed(1)}</span>
    </div>
  </div>
);

const Index = () => {
  const [parsedSVG, setParsedSVG] = useState<ParsedSVG | null>(null);
  const [clearspaceValue, setClearspaceValue] = useState(1);
  const [clearspaceUnit, setClearspaceUnit] = useState<ClearspaceUnit>('logomark');
  const [showGrid, setShowGrid] = useState(false);
  const [gridSubdivisions, setGridSubdivisions] = useState(8);
  const [isInverted, setIsInverted] = useState(false);
  const [canvasBackground, setCanvasBackground] = useState<CanvasBackground>('dark');
  const [modularScaleRatio, setModularScaleRatio] = useState(1.618);
  const [safeZoneMargin, setSafeZoneMargin] = useState(0.1);
  const [svgColorOverride, setSvgColorOverride] = useState<string | null>(null);
  const [geometryOptions, setGeometryOptions] = useState<GeometryOptions>({
    boundingRects: false, circles: false, diagonals: false, goldenRatio: false,
    centerLines: false, tangentLines: false, goldenSpiral: false, isometricGrid: false,
    bezierHandles: false, typographicProportions: false, thirdLines: false,
    symmetryAxes: false, angleMeasurements: false, spacingGuides: false,
    rootRectangles: false, modularScale: false, alignmentGuides: false, safeZone: false,
    pixelGrid: false, opticalCenter: false, contrastGuide: false,
    dynamicBaseline: false, fibonacciOverlay: false, kenBurnsSafe: false, componentRatioLabels: false,
    vesicaPiscis: false, ruleOfOdds: false, visualWeightMap: false, anchoringPoints: false, harmonicDivisions: false,
  });
  const [geometryStyles, setGeometryStyles] = useState<GeometryStyles>({ ...defaultStyles });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Basic: true, Proportions: false, Measurement: false, Harmony: false, Advanced: false });
  const [presets, setPresets] = useState<GeometryPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const projectRef = useRef<paper.Project | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load presets from localStorage on mount
  useEffect(() => {
    const userPresets = loadPresetsFromStorage();
    setPresets([...getBuiltinPresets(), ...userPresets]);
  }, []);

  const currentConfigSnapshot = useMemo(() =>
    JSON.stringify({ geometryOptions, geometryStyles, clearspaceValue, clearspaceUnit, showGrid, gridSubdivisions }),
    [geometryOptions, geometryStyles, clearspaceValue, clearspaceUnit, showGrid, gridSubdivisions]
  );
  const isPresetModified = activePresetId !== null && savedSnapshot !== null && currentConfigSnapshot !== savedSnapshot;

  const activePreset = useMemo(() => presets.find(p => p.id === activePresetId) || null, [presets, activePresetId]);

  const allPresetNames = useMemo(() => presets.map(p => p.name), [presets]);

  const applyPreset = useCallback((preset: GeometryPreset) => {
    setGeometryOptions({ ...preset.geometryOptions });
    setGeometryStyles({ ...preset.geometryStyles });
    setClearspaceValue(preset.clearspaceValue);
    setClearspaceUnit(preset.clearspaceUnit);
    setShowGrid(preset.showGrid);
    setGridSubdivisions(preset.gridSubdivisions);
    setActivePresetId(preset.id);
    setSavedSnapshot(JSON.stringify({
      geometryOptions: preset.geometryOptions, geometryStyles: preset.geometryStyles,
      clearspaceValue: preset.clearspaceValue, clearspaceUnit: preset.clearspaceUnit,
      showGrid: preset.showGrid, gridSubdivisions: preset.gridSubdivisions,
    }));
  }, []);

  const handleSavePreset = useCallback((name: string, description: string) => {
    const newPreset = createPreset({
      name, description, geometryOptions, geometryStyles,
      clearspaceValue, clearspaceUnit, showGrid, gridSubdivisions,
    });
    const updated = [...presets, newPreset];
    setPresets(updated);
    savePresetsToStorage(updated);
    setActivePresetId(newPreset.id);
    setSavedSnapshot(currentConfigSnapshot);
    setSaveDialogOpen(false);
  }, [presets, geometryOptions, geometryStyles, clearspaceValue, clearspaceUnit, showGrid, gridSubdivisions, currentConfigSnapshot]);

  const handleDeletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    savePresetsToStorage(updated);
    if (activePresetId === id) { setActivePresetId(null); setSavedSnapshot(null); }
  }, [presets, activePresetId]);

  const handleRevertPreset = useCallback(() => {
    const preset = presets.find(p => p.id === activePresetId);
    if (preset) applyPreset(preset);
  }, [presets, activePresetId, applyPreset]);

  const handleSVGLoaded = useCallback((svgString: string) => {
    if (!hiddenCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 1; c.height = 1;
      hiddenCanvasRef.current = c;
    }
    const parsed = parseSVG(svgString, hiddenCanvasRef.current);
    setParsedSVG(parsed);
    setIsInverted(false);
  }, []);

  const handleInvert = useCallback(() => {
    if (!parsedSVG) return;
    const newComponents = invertComponents(parsedSVG.components);
    setParsedSVG({ ...parsedSVG, components: newComponents });
    setIsInverted(!isInverted);
  }, [parsedSVG, isInverted]);

  const handleExport = useCallback(() => {
    if (!projectRef.current) return;
    const svgString = exportSVG(projectRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'unbsgrid-export.svg'; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportPNG = useCallback((scale: number) => {
    if (!projectRef.current) return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);
    const url = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = `unbsgrid-export-${scale}x.png`; a.click();
  }, []);

  const toggleGeometry = (key: keyof GeometryOptions) => {
    setGeometryOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateStyle = (key: keyof GeometryOptions, style: GeometryStyle) => {
    setGeometryStyles(prev => ({ ...prev, [key]: style }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <aside className="w-[300px] min-w-[300px] bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="px-4 py-4 border-b border-sidebar-border">
          <h1 className="text-sm font-bold tracking-wide text-foreground">UNBSGRID</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Brand Grid & Construction Generator</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Upload */}
          <section>
            <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider mb-2 block">SVG Upload</Label>
            <SVGDropZone onSVGLoaded={handleSVGLoaded} />
            {parsedSVG && (
              <p className="text-[10px] text-muted-foreground mt-2">
                {parsedSVG.components.length} component{parsedSVG.components.length !== 1 ? 's' : ''} detected
                {parsedSVG.segments.length > 0 && ` · ${parsedSVG.segments.length} bezier points`}
              </p>
            )}
          </section>

          <Separator className="bg-sidebar-border" />

          {/* SVG Color Override */}
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">SVG Color</Label>
              <InfoTooltip content="Altere a cor de todos os caminhos do SVG importado. Útil para testar o logo em diferentes cores ou verificar como ele funciona em monocromático." />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { name: 'Black', color: '#000000' },
                { name: 'White', color: '#ffffff' },
                { name: 'Red', color: '#e53e3e' },
                { name: 'Blue', color: '#3182ce' },
                { name: 'Green', color: '#38a169' },
                { name: 'Gray', color: '#718096' },
                { name: 'Orange', color: '#ED8936' },
                { name: 'Purple', color: '#805AD5' },
                { name: 'Pink', color: '#D53F8C' },
                { name: 'Teal', color: '#319795' },
              ].map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setSvgColorOverride(preset.color)}
                  className={`w-5 h-5 rounded-sm border transition-all ${svgColorOverride === preset.color ? 'border-foreground ring-1 ring-foreground/50 scale-110' : 'border-border/60 hover:border-foreground/40'}`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
              <div className="relative w-5 h-5">
                <input
                  type="color"
                  value={svgColorOverride || '#000000'}
                  onChange={e => setSvgColorOverride(e.target.value)}
                  className="absolute inset-0 w-5 h-5 rounded-sm border border-border/60 bg-transparent cursor-pointer opacity-0"
                />
                <div className="w-5 h-5 rounded-sm border border-dashed border-muted-foreground/50 flex items-center justify-center pointer-events-none"
                  style={svgColorOverride && ![
                    '#000000','#ffffff','#e53e3e','#3182ce','#38a169','#718096','#ED8936','#805AD5','#D53F8C','#319795'
                  ].includes(svgColorOverride) ? { backgroundColor: svgColorOverride, borderStyle: 'solid' } : {}}>
                  <span className="text-[8px] text-muted-foreground">+</span>
                </div>
              </div>
              {svgColorOverride && (
                <button onClick={() => setSvgColorOverride(null)} className="text-muted-foreground hover:text-foreground transition-colors" title="Reset">
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
            {svgColorOverride && (
              <Input
                value={svgColorOverride}
                onChange={e => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v) && v.length === 7) setSvgColorOverride(v);
                }}
                className="h-6 mt-1.5 bg-input border-border text-foreground text-[10px] font-mono"
              />
            )}
          </section>

          <Separator className="bg-sidebar-border" />

          {/* Presets */}
          <PresetManager
            activePreset={activePreset}
            isModified={isPresetModified}
            onSaveClick={() => setSaveDialogOpen(true)}
            onLoadClick={() => setLoadDialogOpen(true)}
            onRevert={handleRevertPreset}
            builtinPresets={presets.filter(p => p.isBuiltin)}
            onApplyPreset={applyPreset}
          />

          <Separator className="bg-sidebar-border" />

          {/* Canvas Background */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Hexagon className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Canvas</Label>
              <InfoTooltip content="Controle o fundo do canvas de visualização. Use 'Checkerboard' para simular transparência, 'Light' para fundos claros e 'Dark' para fundos escuros." />
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Background</Label>
                <Select value={canvasBackground} onValueChange={(v: CanvasBackground) => setCanvasBackground(v)}>
                  <SelectTrigger className="h-8 bg-input border-border text-foreground text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="checkerboard">Checkerboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator className="bg-sidebar-border" />

          {/* Clearspace */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Clearspace</Label>
              <InfoTooltip content="Clearspace (zona de proteção) é a área mínima ao redor do logo onde nenhum outro elemento gráfico deve aparecer. O valor 'X' define a distância em unidades selecionadas. Quanto maior o valor, mais espaço livre ao redor." />
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Value</Label>
                <Input type="number" min={0} step={0.5} value={clearspaceValue}
                  onChange={e => setClearspaceValue(parseFloat(e.target.value) || 0)}
                  className="h-8 bg-input border-border text-foreground text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Unit</Label>
                <UnitSelector value={clearspaceUnit} onChange={setClearspaceUnit} />
              </div>
            </div>
          </section>

          <Separator className="bg-sidebar-border" />

          {/* Construction Grid */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Construction Grid</Label>
              <InfoTooltip content="Gera uma grade modular baseada nas proporções do logomark. Útil para alinhar elementos em layouts. As subdivisões controlam a densidade da grade." />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-foreground">Show Grid</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
              {showGrid && (
                <>
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">Subdivisions</Label>
                    <Input type="number" min={2} max={32} value={gridSubdivisions}
                      onChange={e => setGridSubdivisions(parseInt(e.target.value) || 8)}
                      className="h-8 bg-input border-border text-foreground text-xs" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-foreground">Invert Components</Label>
                      <InfoTooltip content="Troca a detecção automática de qual parte do logo é o ícone (logomark) e qual é o texto (wordmark). A grade e as proporções são calculadas com base no elemento identificado como ícone." />
                    </div>
                    <Switch checked={isInverted} onCheckedChange={handleInvert} />
                  </div>
                </>
              )}
            </div>
          </section>

          <Separator className="bg-sidebar-border" />

          {/* Construction Geometry */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Construction Geometry</Label>
              <InfoTooltip content="Sobreposições geométricas de construção para análise visual do logo. Cada camada pode ter cor, opacidade e espessura de traço personalizados. Ative múltiplas camadas para uma análise completa." />
            </div>
            <div className="space-y-1">
              {geometryGroups.map(group => (
                <Collapsible
                  key={group.label}
                  open={openGroups[group.label]}
                  onOpenChange={open => setOpenGroups(p => ({ ...p, [group.label]: open }))}
                >
                  <CollapsibleTrigger className="flex items-center gap-1.5 w-full py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                    {openGroups[group.label] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    {group.label}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1">
                    {group.keys.map(key => (
                      <div key={key}>
                        <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
                          <Checkbox
                            checked={geometryOptions[key]}
                            onCheckedChange={() => toggleGeometry(key)}
                          />
                          <span className="text-xs text-foreground group-hover:text-foreground transition-colors">{geometryLabels[key]}</span>
                          <span
                            className="ml-auto w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: geometryStyles[key].color }}
                          />
                        </label>
                        {geometryOptions[key] && (
                          <>
                            <StyleControl
                              style={geometryStyles[key]}
                              onChange={s => updateStyle(key, s)}
                            />
                            {/* Extra controls for modularScale */}
                            {key === 'modularScale' && (
                              <div className="pl-7 pr-1 pb-2">
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Ratio</Label>
                                <Select value={String(modularScaleRatio)} onValueChange={v => setModularScaleRatio(parseFloat(v))}>
                                  <SelectTrigger className="h-7 bg-input border-border text-foreground text-[10px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1.25">1.250 (Minor Third)</SelectItem>
                                    <SelectItem value="1.333">1.333 (Perfect Fourth)</SelectItem>
                                    <SelectItem value="1.5">1.500 (Perfect Fifth)</SelectItem>
                                    <SelectItem value="1.618">1.618 (Golden Ratio)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Extra controls for safeZone */}
                            {key === 'safeZone' && (
                              <div className="pl-7 pr-1 pb-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-[10px] text-muted-foreground w-10">Margin</Label>
                                  <Slider
                                    min={1} max={30} step={1}
                                    value={[Math.round(safeZoneMargin * 100)]}
                                    onValueChange={v => setSafeZoneMargin(v[0] / 100)}
                                    className="flex-1"
                                  />
                                  <span className="text-[9px] text-muted-foreground w-8 text-right">{Math.round(safeZoneMargin * 100)}%</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </section>
        </div>

        <div className="px-4 py-3 border-t border-sidebar-border space-y-2">
          <Button onClick={handleExport} disabled={!parsedSVG}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export SVG
          </Button>
          <div className="flex gap-1.5">
            {[1, 2, 4].map(scale => (
              <Button key={scale} variant="outline" size="sm" disabled={!parsedSVG}
                onClick={() => handleExportPNG(scale)}
                className="flex-1 h-7 text-[10px]">
                PNG {scale}x
              </Button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-background p-4">
        <PreviewCanvas
          parsedSVG={parsedSVG}
          clearspaceValue={clearspaceValue}
          clearspaceUnit={clearspaceUnit}
          showGrid={showGrid}
          gridSubdivisions={gridSubdivisions}
          geometryOptions={geometryOptions}
          geometryStyles={geometryStyles}
          canvasBackground={canvasBackground}
          modularScaleRatio={modularScaleRatio}
          safeZoneMargin={safeZoneMargin}
          svgColorOverride={svgColorOverride}
          onProjectReady={p => { projectRef.current = p; }}
        />
      </main>

      <SavePresetDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        existingNames={allPresetNames}
        onSave={handleSavePreset}
      />
      <LoadPresetDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        presets={presets}
        activePresetId={activePresetId}
        onLoad={applyPreset}
        onDelete={handleDeletePreset}
      />
    </div>
  );
};

export default Index;
