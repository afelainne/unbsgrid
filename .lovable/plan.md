

# Enhanced unbsgrid -- Color Controls, Opacity Sliders, and New Geometry Tools

## Summary
Expand the geometry toolset significantly with per-layer color/opacity controls, new construction types (golden spiral, isometric grid, Bezier curve visualization, typographic proportions), and slider-based line weight controls.

---

## 1. Expanded GeometryOptions and Style State

Add new geometry types and per-geometry style settings (color + opacity + stroke width) to `Index.tsx`:

**New geometry types:**
- `goldenSpiral` -- Fibonacci golden spiral overlay
- `isometricGrid` -- 30/60-degree isometric grid lines
- `bezierHandles` -- Show Bezier control points and handles from the SVG paths
- `typographicProportions` -- Cap height, x-height, baseline, ascender/descender guides
- `thirdLines` -- Rule of thirds grid

**Per-geometry style config (new interface `GeometryStyle`):**
```
{ color: string, opacity: number, strokeWidth: number }
```

Each geometry type gets its own `GeometryStyle` with sensible defaults (unique colors per type). Controlled via collapsible sections in the sidebar.

## 2. Sidebar UI Enhancements

For each geometry type in the "Construction Geometry" section:
- Checkbox to toggle on/off (existing pattern)
- When enabled, expand to show:
  - **Color picker** -- simple HTML color input styled to match the dark theme
  - **Opacity slider** -- Slider component (0-100%)
  - **Stroke width slider** -- Slider component (0.5-5px)
- Use the existing `Slider` component from `src/components/ui/slider.tsx`
- Group geometry types into subsections: "Basic", "Proportions", "Advanced"

## 3. New Geometry Rendering in PreviewCanvas

### 3a. Golden Spiral
- Draw a logarithmic golden spiral using quarter-arc segments inside nested golden rectangles
- Start from the logo center, scaling based on logo bounds

### 3b. Isometric Grid
- Lines at 30-degree and 150-degree angles crossing through the logo center
- Additional parallel lines at regular intervals based on subdivisions

### 3c. Bezier Handles Visualization
- During `parseSVG`, extract actual curve segment data (control points) from paper.js paths
- In `PreviewCanvas`, render small dots at control points and thin lines from anchor to control point
- This directly shows the Bezier construction of the logo

### 3d. Typographic Proportions
- Horizontal guides at standard typographic positions relative to logo height:
  - Baseline (bottom), Cap height (top), x-height (~60%), Ascender (~110%), Descender (~-20%)
- Labels on the left side

### 3e. Rule of Thirds
- Divide bounding box into 3x3 grid with intersection markers

## 4. SVG Engine Updates (`svg-engine.ts`)

- Add `extractBezierHandles()` function that walks paper.js path segments and returns arrays of `{ anchor, handleIn, handleOut }` coordinates
- Update `parseSVG` to store raw segment data in a new `segments` field on `ParsedSVG`

## 5. File Changes

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | New `GeometryStyle` interface, expanded `GeometryOptions` with 5 new types, new style state per geometry, sidebar UI with color pickers + sliders per geometry type, collapsible sub-sections |
| `src/components/PreviewCanvas.tsx` | Accept `geometryStyles` prop, render 5 new geometry types (spiral, isometric, bezier, typographic, thirds), apply custom color/opacity/strokeWidth from styles to ALL geometry renderers |
| `src/lib/svg-engine.ts` | Add `BezierSegmentData` interface, `extractBezierHandles()` function, update `ParsedSVG` to include segment data |

## 6. Technical Details

- Colors stored as hex strings, converted to `paper.Color` at render time with opacity applied
- Sliders use the existing Radix `Slider` component
- Color inputs use native `<input type="color">` with dark theme styling
- Golden spiral uses successive 90-degree arcs (`paper.Path.Arc`) inside subdivided golden rectangles
- Bezier handles extracted via `path.segments[i].handleIn` / `handleOut` from paper.js API
- All new geometry respects the same scaled coordinate system used by existing geometry

