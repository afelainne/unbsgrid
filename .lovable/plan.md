

# Seletores de Cor Minimalistas + Presets Inline + Novas Ferramentas

## 1. Seletores de Cor Minimalistas (SVG Color)

A seção atual de SVG Color tem swatches grandes e um input hex separado. Vou simplificar para um layout mais compacto:

- Reduzir swatches de 28px para 20px (w-5 h-5)
- Remover o color picker nativo grande, integrar como um swatch extra "Custom" com ícone
- Mover o input hex para inline ao lado dos swatches
- Botão de reset mais discreto (ghost, sem borda)
- Adicionar mais presets de cor: Orange (#ED8936), Purple (#805AD5), Pink (#D53F8C), Teal (#319795)

## 2. Presets Default Inline

Remover a seção PresetManager atual e substituir por:
- Manter botões "Carregar" e "Salvar" 
- Logo abaixo, mostrar os presets builtin como botões pequenos (pills/chips) clicáveis
- Cada preset builtin aparece como um chip com nome curto
- Criar novos presets builtin:
  - **"Minimalista"** (existente) - bounding rects + center lines
  - **"Proporções Aureas"** (existente) - golden ratio, spiral, thirds
  - **"Analise Completa"** (existente) - tudo ativo
  - **"Construcao Tecnica"** (existente) - bezier, isometric, center, bounding
  - **"Simetria"** (novo) - symmetry axes, center lines, alignment guides
  - **"Fibonacci"** (novo) - fibonacci overlay, golden ratio, golden spiral
  - **"Broadcast Safe"** (novo) - ken burns safe, safe zone, bounding rects
  - **"Tipografia"** (novo) - typographic proportions, dynamic baseline, spacing guides

## 3. Novas Ferramentas de Geometria

Adicionar 5 novas ferramentas:

### 3.1 Vesica Piscis
- Interseção de dois círculos sobrepostos (forma clássica de construção de logos)
- Dois círculos centrados nos terços horizontais do logo
- Grupo: "Harmony"

### 3.2 Rule of Odds
- Divide o logo em 5 e 7 seções (composição ímpar)
- Linhas verticais e horizontais em quintos e sétimos
- Grupo: "Proportions"

### 3.3 Visual Weight Map
- Quadrantes com indicadores de peso visual (top-left, top-right, bottom-left, bottom-right)
- Retangulos semitransparentes com labels de porcentagem
- Grupo: "Advanced"

### 3.4 Anchoring Points
- Marca pontos de ancoragem visual (cantos, centros de borda, centro)
- 9 pontos com indicadores crosshair
- Grupo: "Basic"

### 3.5 Harmonic Divisions
- Divisões harmônicas baseadas em raízes musicais (1/2, 1/3, 1/4, 1/5, 1/6)
- Linhas horizontais e verticais com labels das frações
- Grupo: "Measurement"

## Resumo de Arquivos

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/Index.tsx` | SVG Color minimalista; presets inline como chips abaixo dos botoes; 5 novos campos em GeometryOptions/Styles/Labels/Groups; mais presets de cor |
| `src/components/PresetManager.tsx` | Adicionar prop `builtinPresets` e renderizar como chips abaixo dos botoes |
| `src/components/geometry-renderers.ts` | 5 novas funcoes: `renderVesicaPiscis`, `renderRuleOfOdds`, `renderVisualWeightMap`, `renderAnchoringPoints`, `renderHarmonicDivisions` |
| `src/components/PreviewCanvas.tsx` | Integrar 5 novos renderers |
| `src/lib/preset-engine.ts` | 4 novos presets builtin + 5 novos campos nos defaults |

## Detalhes Tecnicos

### SVG Color Section (Index.tsx)
```
Layout: row de swatches 20x20 + swatch "custom" com picker + input hex inline
Cores: Black, White, Red, Blue, Green, Gray, Orange, Purple, Pink, Teal
Reset: botao ghost pequeno com icone RotateCcw
```

### Presets Inline (PresetManager.tsx)
```
Props adicionais: builtinPresets: GeometryPreset[], onApplyPreset: (preset) => void
Renderizar: flex-wrap gap-1.5 de botoes variant="outline" size="sm" h-6 text-[9px]
Preset ativo: variant="default" (cor primaria)
```

### Novos Renderers (geometry-renderers.ts)
- `renderVesicaPiscis(bounds, style)` - dois circulos sobrepostos com area de intersecao destacada
- `renderRuleOfOdds(bounds, style)` - divisoes em quintos e setimos
- `renderVisualWeightMap(bounds, scaledCompBounds, style)` - quadrantes com peso visual
- `renderAnchoringPoints(bounds, style)` - 9 pontos de ancoragem com crosshairs
- `renderHarmonicDivisions(bounds, style)` - divisoes harmonicas com labels

