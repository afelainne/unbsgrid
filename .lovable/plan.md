

# Hover Selection nos Controles + Textos e Botões Menores

## 1. Hover Selection nos Controles de Geometria

Adicionar um efeito de hover highlight em cada item de geometria na sidebar, para que ao passar o mouse o item inteiro se destaque visualmente.

### Mudanças em `src/pages/Index.tsx`:

- Cada `label` de geometria (linha 521) recebe classes de hover: `hover:bg-sidebar-accent rounded-md px-1.5 -mx-1.5 transition-colors`
- O grupo collapsible trigger (linha 514) recebe hover mais visível
- Seções inteiras (Canvas, Clearspace, Grid) recebem hover sutil nos controles internos
- Swatches de cor SVG recebem hover com scale e borda

## 2. Textos e Botões Menores

Reduzir tamanhos em toda a sidebar para um visual mais compacto e profissional:

### Títulos de seção:
- De `text-xs` para `text-[10px]` nos Labels de seção (SVG Upload, SVG Color, Canvas, Clearspace, Construction Grid, Construction Geometry)
- Ícones de seção de `h-3.5 w-3.5` para `h-3 w-3`

### Controles:
- Labels internos (Value, Unit, Background, Show Grid, etc.) de `text-xs` para `text-[10px]`
- Inputs e Selects de `h-8` para `h-7`
- StyleControl labels de `text-[10px]` para `text-[9px]`
- StyleControl spacing de `space-y-2` para `space-y-1.5`

### Geometria:
- Labels de geometria (Bounding Rectangles, etc.) de `text-xs` para `text-[10px]`
- Color swatch de `w-3 h-3` para `w-2.5 h-2.5`
- Group triggers de `text-[10px]` para `text-[9px]`
- Chevrons de `h-3 w-3` para `h-2.5 w-2.5`

### Export:
- Botão Export SVG de `h-9` para `h-8`, texto de `text-xs` para `text-[10px]`
- Botões PNG de `h-7` para `h-6`, texto de `text-[10px]` para `text-[9px]`

### Header:
- Título UNBSGRID de `text-sm` para `text-xs`
- Subtítulo de `text-[10px]` para `text-[9px]`
- Padding do header de `py-4` para `py-3`

### Presets:
- PresetManager botões de `h-7` para `h-6`
- Chips de preset de `text-[9px]` para `text-[8px]`

## Resumo de Arquivos

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/Index.tsx` | Hover effects em todos os controles; reduzir tamanhos de textos, inputs, botões e ícones em toda a sidebar |
| `src/components/PresetManager.tsx` | Reduzir tamanhos dos botões e chips |

