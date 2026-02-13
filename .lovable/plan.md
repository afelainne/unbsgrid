

# Revisao Completa do Sistema de Criacao - UNBSGRID

## Visao Geral da Arquitetura Atual

O sistema e composto por 4 camadas principais:

| Camada | Arquivo(s) | Responsabilidade |
|--------|-----------|------------------|
| Motor SVG | `svg-engine.ts` | Parse, geometria, clearspace, grid |
| Renderizadores | `geometry-renderers.ts` (2737 linhas) | 34 ferramentas de analise geometrica |
| Canvas | `PreviewCanvas.tsx` | Renderizacao, zoom, pan, composicao |
| Interface | `Index.tsx` (1082 linhas) | Sidebar, controles, estado, export |
| Presets | `preset-engine.ts` | 10 presets integrados + salvamento |

---

## Problemas Identificados

### 1. Index.tsx e um "God Component" (1082 linhas)
- Contem **35+ estados** (useState) em um unico componente
- Mistura logica de negocio, UI, e handlers de export
- Dificil de manter e debugar

**Solucao**: Extrair em modulos menores:
- `useSVGState.ts` - hook custom para todo o estado SVG (parse, color, outline)
- `useGeometryState.ts` - hook para opcoes e estilos de geometria
- `usePresetState.ts` - hook para gestao de presets
- `SidebarSections/` - pasta com componentes para cada secao da sidebar (Upload, Color, Outline, Canvas, Clearspace, Grid, Geometry)
- `ExportPanel.tsx` - componente para os botoes de export

### 2. geometry-renderers.ts e monolitico (2737 linhas)
- 34 funcoes de renderizacao em um unico arquivo
- Codigo repetitivo de verificacao de intersecao em cada renderer
- Dificil localizar e editar renderizadores especificos

**Solucao**: Separar em modulos por grupo:
- `renderers/basic.ts` - boundingRects, circles, centerLines, diagonals, tangentLines, anchoringPoints
- `renderers/proportions.ts` - goldenRatio, goldenSpiral, thirdLines, typographic, ruleOfOdds
- `renderers/measurement.ts` - symmetryAxes, angle, spacing, alignment, baseline, ratioLabels, harmonic
- `renderers/harmony.ts` - rootRectangles, modularScale, safeZone, fibonacci, vesicaPiscis
- `renderers/grid.ts` - isometricGrid, pixelGrid, contrastGuide, kenBurns
- `renderers/advanced.ts` - parallelFlow, underlyingCircles, dominantDiagonals, curvatureComb, skeleton, constructionGrid, pathDirection, tangentIntersections, anchorPoints, bezierHandles
- `renderers/utils.ts` - hexToColor, showIfIntersects, intersectsAnyPath, RenderContext, StyleConfig
- `renderers/index.ts` - re-exports

### 3. Logica de intersecao repetida
- Cada renderer reimplementa a verificacao `context?.useRealData && context?.actualPaths`
- O pattern de "criar item, testar intersecao, remover se nao intersecta" se repete dezenas de vezes

**Solucao**: Ja existe `showIfIntersects()` mas nao e usado em todos os renderers. Padronizar o uso em todos.

### 4. Acoplamento circular de tipos
- `GeometryOptions`, `GeometryStyles` e `CanvasBackground` sao definidos em `Index.tsx` (uma pagina)
- `PreviewCanvas.tsx` e `preset-engine.ts` importam de `Index.tsx`

**Solucao**: Mover os tipos para um arquivo dedicado `src/types/geometry.ts`

### 5. Performance do Canvas
- `draw()` recria TUDO a cada mudanca (importSVG, scale, todos os renderers)
- Sem memoizacao do SVG importado ou dos paths extraidos
- O SVG e reimportado via `paper.project.importSVG()` em cada render

**Solucao**: Cache do item importado e dos paths, so recalcular quando o SVG fonte muda

### 6. Export duplicado
- `handleExportOutlineSVG` reimplementa a logica de color override e outline que ja existe em `PreviewCanvas`

**Solucao**: Compartilhar a logica de transformacao SVG entre preview e export

### 7. Sidebar sem scroll indicators
- A sidebar tem muitas secoes mas nao tem indicadores visuais de que ha mais conteudo abaixo

---

## Plano de Implementacao

### Fase 1: Extrair tipos (baixo risco)
1. Criar `src/types/geometry.ts` com `GeometryOptions`, `GeometryStyles`, `GeometryStyle`, `CanvasBackground`
2. Atualizar imports em `Index.tsx`, `PreviewCanvas.tsx`, `preset-engine.ts`

### Fase 2: Separar renderers (medio risco)
1. Criar pasta `src/components/renderers/`
2. Mover `hexToColor`, `intersectsAnyPath`, `showIfIntersects`, `RenderContext`, `StyleConfig` para `utils.ts`
3. Separar funcoes por grupo nos arquivos listados acima
4. Criar `index.ts` com re-exports
5. Atualizar import em `PreviewCanvas.tsx`

### Fase 3: Extrair hooks de estado (medio risco)
1. Criar `src/hooks/useSVGState.ts` - estado de parse, color, outline
2. Criar `src/hooks/useGeometryState.ts` - opcoes, estilos, groups
3. Criar `src/hooks/usePresetState.ts` - presets, apply, save, delete, revert
4. Simplificar `Index.tsx` para ~300 linhas

### Fase 4: Componentizar sidebar (baixo risco)
1. Criar `src/components/sidebar/` com componentes por secao
2. Mover JSX das secoes de `Index.tsx` para componentes dedicados

### Fase 5: Otimizacao de performance (alto impacto)
1. Cache do item SVG importado no `PreviewCanvas`
2. Separar renderizacao do SVG base da renderizacao de geometria
3. Usar `useMemo` para paths extraidos

---

## Estimativa

- Fase 1: 1 mensagem
- Fase 2: 2-3 mensagens
- Fase 3: 1-2 mensagens
- Fase 4: 2 mensagens
- Fase 5: 1-2 mensagens

**Total estimado: 7-10 mensagens**

Recomendo comecar pela **Fase 1 + 2** pois resolvem os maiores problemas de manutencao sem alterar comportamento visivel, e depois seguir com as demais fases incrementalmente.

