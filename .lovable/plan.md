

# unbsgrid — Brand Grid & Construction Generator

## Overview
A professional web tool for brand designers that automates the creation of construction grids, geometric overlays, and clearspace zones from SVG logos. Adobe Dark Mode aesthetic, fully client-side processing.

---

## 1. Design System — "Adobe Dark Mode"
- Dark background (#303030), deep input fields (#0E0E0E), blue accents (#5EAaF7)
- Font: **Inter** (web-safe Adobe Clean alternative) with Regular/Bold weights
- Custom-styled dropdowns with blue checkmarks, toggle switches with smooth transitions
- Info tooltips matching Adobe-style popups

## 2. SVG Upload & Parsing
- Drag-and-drop zone with file browser fallback
- Parse uploaded SVG files and extract all vector paths
- Use **paper.js** to compute accurate bounding boxes from Bezier curves (not just anchor points)
- Display the uploaded logo centered on an artboard-style canvas

## 3. Clearspace (Exclusion Zone) Generator
- Input field to define the protection margin value
- Unit selector dropdown with options: **Logomark**, **Pixels**, **Centimeters**, **Inches**
  - Logomark mode: derives 'X' proportionally from the main icon's dimensions
  - Physical units use precise conversions (1in = 72px, 1cm = 28.346px)
- Renders four protection zones (top, bottom, left, right) as semi-transparent overlays in real-time

## 4. Grid Generator
- Generate modular construction grids overlaid on the logo
- **Invert Components** toggle switch — swaps detection of which element is the icon vs. the wordmark
- Grid lines rendered on a separate layer above the SVG with adjustable opacity

## 5. Real-Time Preview Canvas
- Interactive canvas (using paper.js) showing the SVG with grid and clearspace layers
- Layers update instantly as the user adjusts settings
- Clean zoom/pan controls for inspecting details

## 6. SVG Export
- Export button to download the final composition as a clean SVG file
- Grid lines and clearspace guides converted to proper SVG paths
- Preserves original logo paths alongside the generated guides

## 7. UI Components
- Custom select dropdown (Adobe-style with blue checkmarks)
- Toggle switch with animated slide transition
- Info popups/tooltips on hover for each feature
- Responsive layout optimized for desktop use

---

## Architecture Notes
- **No backend needed** — all SVG processing runs client-side via paper.js
- Auth can be layered in later via Supabase when monetization is needed
- Single-page app with all tools accessible from one workspace view

