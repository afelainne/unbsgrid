

# Novas Ferramentas Visuais para unbsgrid

## Visao Geral
Adicionar 7 novas ferramentas de geometria de construcao, controles de canvas (zoom, pan, background), e funcionalidades visuais avancadas para tornar o unbsgrid um gerador de grid profissional completo.

---

## 1. Novas Ferramentas de Geometria (7 novos tipos)

### 1.1 Symmetry Axes (Eixos de Simetria)
- Detecta e renderiza eixos de simetria vertical/horizontal do logo
- Linhas tracejadas finas mostrando onde o logo se espelha

### 1.2 Angle Measurements (Medicoes de Angulos)
- Mostra angulos entre diagonais e linhas principais
- Arcos com labels de graus nos cantos dos componentes

### 1.3 Spacing Guides (Guias de Espacamento)
- Linhas duplas mostrando distancias entre componentes
- Labels com valores em pixels entre cada par de componentes
- Setas bidirecionais indicando gaps

### 1.4 Root Rectangles (Retangulos Raiz)
- Retangulos com proporcoes matematicas classicas: raiz de 2, raiz de 3, raiz de 5
- Overlay centrado no logo com cada proporcao em cor diferente

### 1.5 Modular Scale
- Circulos concentricos baseados em escala modular (ratio configuravel: 1.25, 1.333, 1.5, 1.618)
- Mostra como os elementos se alinham com uma progressao harmonica

### 1.6 Alignment Guides
- Linhas de alinhamento entre componentes (top-to-top, bottom-to-bottom, center-to-center)
- Highlights onde componentes se alinham naturalmente

### 1.7 Safe Zone (Zona Minima)
- Area interna minima onde o logo deve permanecer legivel
- Retangulo interno com margem configuravel, diferente do clearspace externo

## 2. Controles de Canvas

### 2.1 Toolbar no topo do canvas
- Botoes: Zoom In (+), Zoom Out (-), Fit to Screen, Reset Zoom (100%)
- Toggle de background: Branco, Escuro, Checkerboard (transparencia)
- Toggle de snap-to-grid

### 2.2 Pan/Drag
- Click + drag para mover o canvas (pan)
- Indicador de posicao X,Y do cursor relativo ao logo

### 2.3 Ruler/Measurement Mode
- Reguas no topo e na lateral do canvas mostrando pixels
- Atualizam com zoom

## 3. Export Avancado

### 3.1 Opcoes de export
- Dropdown com formatos: SVG, PNG (com resolucao configuravel: 1x, 2x, 4x)
- Checkbox para incluir/excluir cada camada no export
- Opcao de exportar apenas as guias (sem o logo)

---

## 4. Implementacao Tecnica

### Novos tipos em GeometryOptions
```text
symmetryAxes, angleMeasurements, spacingGuides,
rootRectangles, modularScale, alignmentGuides, safeZone
```

### Arquivos modificados

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/Index.tsx` | Adicionar 7 novos campos em GeometryOptions/Styles, novos grupos na sidebar ("Measurement", "Harmony"), controles de background e export avancado |
| `src/components/geometry-renderers.ts` | 7 novas funcoes de renderizacao |
| `src/components/PreviewCanvas.tsx` | Integrar novos renderers, toolbar de canvas com zoom/pan/background, reguas, cursor position |
| `src/lib/preset-engine.ts` | Atualizar presets builtin com novos campos |

### Novos renderers em geometry-renderers.ts

- `renderSymmetryAxes(bounds, scaledCompBounds, style)` -- linhas de simetria
- `renderAngleMeasurements(bounds, scaledCompBounds, style)` -- arcos com graus
- `renderSpacingGuides(bounds, scaledCompBounds, style)` -- distancias entre componentes
- `renderRootRectangles(bounds, style)` -- retangulos raiz de 2, 3, 5
- `renderModularScale(bounds, style, ratio)` -- circulos em escala modular
- `renderAlignmentGuides(bounds, scaledCompBounds, style)` -- linhas de alinhamento
- `renderSafeZone(bounds, style, margin)` -- zona segura interna

### Canvas toolbar
- Componente inline no topo do canvas com botoes de zoom, seletor de background, e indicador de posicao
- Background modes: `'dark' | 'light' | 'checkerboard'`
- Pan implementado via mouse drag + state de offset (translateX, translateY)

### Export avancado
- PNG export via `canvas.toDataURL('image/png')` com escala multiplicada
- Dialog com checkboxes para selecionar camadas a exportar

