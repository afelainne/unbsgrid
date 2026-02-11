import React, { useState, useCallback, useRef } from 'react';
import paper from 'paper';
import { Download, Grid3X3, Shield, Circle, Triangle, Layers, Ruler } from 'lucide-react';
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
import { parseSVG, invertComponents, exportSVG, type ParsedSVG, type ClearspaceUnit } from '@/lib/svg-engine';

export interface GeometryOptions {
  boundingRects: boolean;
  circles: boolean;
  diagonals: boolean;
  goldenRatio: boolean;
  centerLines: boolean;
  tangentLines: boolean;
}

const Index = () => {
  const [parsedSVG, setParsedSVG] = useState<ParsedSVG | null>(null);
  const [clearspaceValue, setClearspaceValue] = useState(1);
  const [clearspaceUnit, setClearspaceUnit] = useState<ClearspaceUnit>('logomark');
  const [showGrid, setShowGrid] = useState(false);
  const [gridSubdivisions, setGridSubdivisions] = useState(8);
  const [isInverted, setIsInverted] = useState(false);
  const [geometryOptions, setGeometryOptions] = useState<GeometryOptions>({
    boundingRects: false,
    circles: false,
    diagonals: false,
    goldenRatio: false,
    centerLines: false,
    tangentLines: false,
  });
  const projectRef = useRef<paper.Project | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSVGLoaded = useCallback((svgString: string) => {
    if (!hiddenCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
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
    a.href = url;
    a.download = 'unbsgrid-export.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const toggleGeometry = (key: keyof GeometryOptions) => {
    setGeometryOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] min-w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <h1 className="text-sm font-bold tracking-wide text-foreground">UNBSGRID</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Brand Grid & Construction Generator</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Upload Section */}
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">SVG Upload</Label>
            </div>
            <SVGDropZone onSVGLoaded={handleSVGLoaded} />
            {parsedSVG && (
              <p className="text-[10px] text-muted-foreground mt-2">
                {parsedSVG.components.length} component{parsedSVG.components.length !== 1 ? 's' : ''} detected
              </p>
            )}
          </section>

          <Separator className="bg-sidebar-border" />

          {/* Clearspace Section */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Clearspace</Label>
              <InfoTooltip content="Define the protection zone around your logo. The 'X' value creates an exclusion area where no other elements should be placed." />
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Value</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={clearspaceValue}
                  onChange={(e) => setClearspaceValue(parseFloat(e.target.value) || 0)}
                  className="h-8 bg-input border-border text-foreground text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Unit</Label>
                <UnitSelector value={clearspaceUnit} onChange={setClearspaceUnit} />
              </div>
            </div>
          </section>

          <Separator className="bg-sidebar-border" />

          {/* Construction Grid Section */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Grid3X3 className="h-3.5 w-3.5 text-primary" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Construction Grid</Label>
              <InfoTooltip content="Generate a modular construction grid based on the logomark dimensions." />
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
                    <Input
                      type="number"
                      min={2}
                      max={32}
                      value={gridSubdivisions}
                      onChange={(e) => setGridSubdivisions(parseInt(e.target.value) || 8)}
                      className="h-8 bg-input border-border text-foreground text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-foreground">Invert Components</Label>
                      <InfoTooltip content="Swap which element is treated as the icon vs. the wordmark for grid calculations." />
                    </div>
                    <Switch checked={isInverted} onCheckedChange={handleInvert} />
                  </div>
                </>
              )}
            </div>
          </section>

          <Separator className="bg-sidebar-border" />

          {/* Construction Geometry Section */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <Label className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Construction Geometry</Label>
              <InfoTooltip content="Overlay geometric construction aids like circles, rectangles, diagonals, and golden ratio guides used in professional logo design." />
            </div>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={geometryOptions.boundingRects}
                  onCheckedChange={() => toggleGeometry('boundingRects')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">Bounding Rectangles</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={geometryOptions.circles}
                  onCheckedChange={() => toggleGeometry('circles')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">Inscribed / Circumscribed Circles</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={geometryOptions.centerLines}
                  onCheckedChange={() => toggleGeometry('centerLines')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">Center / Axis Lines</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={geometryOptions.diagonals}
                  onCheckedChange={() => toggleGeometry('diagonals')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">Diagonal Lines</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={geometryOptions.goldenRatio}
                  onCheckedChange={() => toggleGeometry('goldenRatio')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">Golden Ratio Circles</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={geometryOptions.tangentLines}
                  onCheckedChange={() => toggleGeometry('tangentLines')}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">Tangent Lines</span>
              </label>
            </div>
          </section>
        </div>

        {/* Export Button */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <Button
            onClick={handleExport}
            disabled={!parsedSVG}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export SVG
          </Button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 bg-background p-4">
        <PreviewCanvas
          parsedSVG={parsedSVG}
          clearspaceValue={clearspaceValue}
          clearspaceUnit={clearspaceUnit}
          showGrid={showGrid}
          gridSubdivisions={gridSubdivisions}
          geometryOptions={geometryOptions}
          onProjectReady={(p) => { projectRef.current = p; }}
        />
      </main>
    </div>
  );
};

export default Index;
