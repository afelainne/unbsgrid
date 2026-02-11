

# Correções e Novas Ferramentas

## 1. Remover cor #F0FF00 dos ícones de seção e InfoTooltip

Os ícones de informação e de seção (Palette, Hexagon, Shield, Grid3X3, Layers) estão usando `text-primary` que é #F0FF00. Devem usar cor neutra.

### Arquivos:
- **`src/components/InfoTooltip.tsx`**: Trocar `text-primary` por `text-muted-foreground` no botão do ícone Info
- **`src/pages/Index.tsx`**: Trocar `text-primary` dos ícones de seção (Palette, Hexagon, Shield, Grid3X3, Layers) por `text-muted-foreground`. Também remover `group-hover:text-primary` dos labels de geometria, trocando por `group-hover:text-foreground`

## 2. Adicionar dicas úteis em cada InfoTooltip

Atualmente os tooltips têm textos genéricos. Cada um receberá uma explicação detalhada e prática:

| Seção | Dica |
|-------|------|
| Clearspace | "Clearspace (zona de proteção) é a área mínima ao redor do logo onde nenhum outro elemento gráfico deve aparecer. O valor 'X' define a distância em unidades selecionadas. Quanto maior o valor, mais espaço livre ao redor." |
| Construction Grid | "Gera uma grade modular baseada nas proporções do logomark. Útil para alinhar elementos em layouts. As subdivisões controlam a densidade da grade. Use 'Invert Components' para trocar qual elemento é considerado o ícone principal." |
| Invert Components | "Troca a detecção automática de qual parte do logo é o ícone (logomark) e qual é o texto (wordmark). A grade e as proporções são calculadas com base no elemento identificado como ícone." |
| Construction Geometry | "Sobreposições geométricas de construção para análise visual do logo. Cada camada pode ter cor, opacidade e espessura de traço personalizados. Ative múltiplas camadas para uma análise completa." |

Adicionar também InfoTooltips nas seções que não têm:
- **SVG Color**: "Altere a cor de todos os caminhos do SVG importado. Útil para testar o logo em diferentes cores ou verificar como ele funciona em monocromático."
- **Canvas**: "Controle o fundo do canvas de visualização. Use 'Checkerboard' para simular transparência, 'Light' para fundos claros e 'Dark' para fundos escuros."

## 3. Revisão do Clearspace duplo

Analisando o código e a imagem: o clearspace é renderizado UMA vez, criando 4 retângulos (topo, base, esquerda, direita) ao redor do bounds do SVG. O que aparece como "duplo" na imagem é provavelmente o clearspace + outra ferramenta ativa (como Bounding Rectangles ou Safe Zone), que criam visuais similares em azul/transparente. O clearspace em si está correto.

Porém, para evitar confusão visual, vou melhorar a diferenciação:
- Adicionar um contorno tracejado (dashed border) ao redor da zona de clearspace para distingui-la visualmente de outras camadas
- Mudar a cor do label "X" do clearspace de azul para uma cor mais distinta

## 4. Novas Ferramentas de Geometria

Adicionar 4 novas ferramentas ao sistema:

### 4.1 Dynamic Baseline Grid
- Grade horizontal baseada no tamanho do texto/tipografia do logo
- Linhas horizontais espaçadas uniformemente para alinhamento tipográfico
- Grupo: "Measurement"

### 4.2 Fibonacci Overlay
- Retângulos de Fibonacci sobrepostos no logo
- Mostra como o design se alinha com a sequência de Fibonacci
- Grupo: "Harmony"

### 4.3 Ken Burns Safe Area
- Zona segura para animações e redimensionamento (broadcast safe area)
- Retângulo interno com margem de 10% para garantir visibilidade em todas as mídias
- Grupo: "Advanced"

### 4.4 Component Ratio Labels
- Exibe labels com as proporções (aspect ratios) de cada componente
- Ex: "1:1.414" ou "16:9" próximo a cada bounding box
- Grupo: "Measurement"

## Resumo de Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `src/components/InfoTooltip.tsx` | Cor do ícone de `text-primary` para `text-muted-foreground` |
| `src/pages/Index.tsx` | Cores dos ícones de seção para neutro; textos detalhados nos InfoTooltips; novos InfoTooltips em SVG Color e Canvas; 4 novos campos em GeometryOptions/Styles/Labels/Groups; remover hover amarelo dos labels |
| `src/components/geometry-renderers.ts` | 4 novas funções: `renderDynamicBaseline`, `renderFibonacciOverlay`, `renderKenBurnsSafe`, `renderComponentRatioLabels` |
| `src/components/PreviewCanvas.tsx` | Integrar 4 novos renderers; melhorar diferenciação visual do clearspace (borda tracejada) |
| `src/lib/preset-engine.ts` | Adicionar 4 novos campos nos presets default |

