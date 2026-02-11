

# Novas Ferramentas + Modo de Cor do SVG + Correção de Cor de Destaque

## 1. Correção da Cor de Destaque (#F0FF00)

A cor primária atual é `54 100% 50%` (amarelo). A cor correta é `#F0FF00` = HSL `64 100% 50%`.

**Regra importante**: A cor `#F0FF00` deve aparecer APENAS em botões (CTA). Sliders, switches, checkboxes e selects devem usar cores neutras (cinza).

### Mudanças nos componentes UI:

**`src/index.css`** - Atualizar `--primary` para `64 100% 50%` e criar variáveis neutras para controles de formulário.

**`src/components/ui/slider.tsx`** - Trocar `bg-primary` por cinza neutro (`bg-foreground/30`) no Range e `border-primary` por `border-foreground/40` no Thumb.

**`src/components/ui/switch.tsx`** - Trocar `data-[state=checked]:bg-primary` por `data-[state=checked]:bg-foreground/60` (cinza escuro quando ativo).

**`src/components/ui/checkbox.tsx`** - Trocar `border-primary`, `data-[state=checked]:bg-primary` por variantes cinza (`border-foreground/30`, `data-[state=checked]:bg-foreground/70`).

**`src/components/ui/select.tsx`** - Trocar `focus:bg-accent focus:text-accent-foreground` no SelectItem por `focus:bg-secondary focus:text-secondary-foreground`.

**`src/pages/Index.tsx`** - Remover `data-[state=checked]:bg-primary data-[state=checked]:border-primary` inline dos Checkboxes (o componente base cuidará disso).

---

## 2. Modo de Cor do SVG

Nova seção "SVG Color" na sidebar que permite alterar a cor de todos os paths/fills do SVG importado.

### Funcionalidades:
- **Presets de cor**: Preto, Branco, Vermelho, Azul, Verde, Cinza (botões com swatches)
- **Cor manual**: Input de cor (color picker nativo) + campo hex
- **Reset**: Botão para restaurar cores originais do SVG

### Implementação:

**`src/pages/Index.tsx`**:
- Novo state: `svgColorOverride: string | null` (null = cores originais)
- Nova seção na sidebar entre "SVG Upload" e "Presets"
- Presets: array de cores pré-definidas com nomes
- Color picker nativo + input hex editável
- Botão "Reset to Original"

**`src/components/PreviewCanvas.tsx`**:
- Nova prop: `svgColorOverride?: string | null`
- Após `importSVG()`, se `svgColorOverride` estiver definido, iterar todos os children do item e aplicar `fillColor` e `strokeColor` com a cor escolhida

---

## 3. Novas Ferramentas Visuais

### 3.1 Pixel Grid Overlay
- Grid de pixels finos sobre o logo em alta resolução
- Útil para verificar alinhamento em nível de pixel
- Adicionado como nova opção em GeometryOptions: `pixelGrid`

### 3.2 Optical Center
- Marca o centro óptico do logo (ligeiramente acima do centro geométrico)
- Cruz + círculo no ponto óptico
- Nova opção: `opticalCenter`

### 3.3 Contrast Ratio Guide  
- Mostra áreas de alto e baixo contraste entre o logo e o background
- Overlay com heatmap simplificado
- Nova opção: `contrastGuide`

### Mudanças em arquivos:

**`src/pages/Index.tsx`**:
- Adicionar `pixelGrid`, `opticalCenter`, `contrastGuide` ao GeometryOptions
- Adicionar labels e estilos default
- Adicionar ao grupo "Advanced"

**`src/components/geometry-renderers.ts`**:
- `renderPixelGrid(bounds, style, subdivisions)` - grid fino de 1px
- `renderOpticalCenter(bounds, style)` - centro óptico com marcadores
- `renderContrastGuide(bounds, style)` - guias de contraste

**`src/components/PreviewCanvas.tsx`**:
- Integrar 3 novos renderers

**`src/lib/preset-engine.ts`**:
- Adicionar novos campos nos presets default

---

## Resumo de Arquivos

| Arquivo | Mudanças |
|---------|----------|
| `src/index.css` | Cor primary para #F0FF00 (64 100% 50%) |
| `src/components/ui/slider.tsx` | Range e thumb neutros (cinza) |
| `src/components/ui/switch.tsx` | Checked state neutro (cinza) |
| `src/components/ui/checkbox.tsx` | Checked/border neutros (cinza) |
| `src/components/ui/select.tsx` | Focus state neutro |
| `src/pages/Index.tsx` | Novo SVG Color mode, 3 novos geometry options, remover overrides inline de checkbox |
| `src/components/PreviewCanvas.tsx` | Prop svgColorOverride + 3 novos renderers |
| `src/components/geometry-renderers.ts` | 3 novas funções de renderização |
| `src/lib/preset-engine.ts` | Novos campos nos presets |

