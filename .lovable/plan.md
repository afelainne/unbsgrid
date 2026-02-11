
# Atualização de Visual e Cores para Tema Claro

## Visão Geral
Transformar a interface do **unbsgrid** de um tema escuro (Adobe Dark Mode) para um tema claro e minimalista, inspirado na imagem de referência. Isso inclui:
- Mudança de paleta de cores para tons claros (cinza, bege, branco)
- Destaque em amarelo/limão para elementos ativos/primários
- Remoção de citações de "Akrivi Gridit" do código
- Atualização das variáveis CSS e estilos relacionados

## 1. Mudanças de Paleta de Cores

### Análise da Imagem de Referência
- **Background principal**: Cinza claro/bege (#E8E8E8 ou similar)
- **Cards/Containers**: Branco (#FFFFFF) com bordas sutis
- **Texto primário**: Cinza escuro (#333333 ou #444444)
- **Texto secundário**: Cinza médio (#777777)
- **Destaque/Acento**: Amarelo vibrante (#FFFF00 ou #E8FF00) para elementos ativos
- **Bordas**: Cinza muito claro (#D0D0D0)

### Mapeamento de Variáveis CSS (src/index.css)

Mudanças nas propriedades CSS custom `:root`:

```
--background: 0 0% 93%;           // De 19% para 93% (claro)
--foreground: 0 0% 25%;           // De 90% para 25% (escuro)

--card: 0 0% 100%;                // De 15% para 100% (branco)
--card-foreground: 0 0% 20%;      // De 90% para 20% (escuro)

--popover: 0 0% 98%;              // De 12% para 98%
--popover-foreground: 0 0% 20%;   // De 90% para 20%

--primary: 54 100% 50%;           // Muda para amarelo vibrante
--primary-foreground: 0 0% 10%;   // De 100% para 10% (texto escuro)

--secondary: 0 0% 85%;            // De 22% para 85% (cinza claro)
--secondary-foreground: 0 0% 30%; // De 80% para 30%

--muted: 0 0% 80%;                // De 25% para 80%
--muted-foreground: 0 0% 50%;     // De 55% para 50%

--accent: 54 100% 50%;            // Amarelo vibrante (mesmo do primary)
--accent-foreground: 0 0% 10%;    // Texto escuro

--border: 0 0% 85%;               // De 27% para 85% (cinza claro)
--input: 0 0% 98%;                // De 5.5% para 98% (quase branco)

--canvas: 0 0% 95%;               // De 24% para 95%
--surface: 0 0% 100%;             // De 15% para 100% (branco)
--surface-hover: 0 0% 95%;        // De 20% para 95%

--sidebar-background: 0 0% 98%;   // De 14% para 98%
--sidebar-foreground: 0 0% 30%;   // De 85% para 30%
--sidebar-primary: 54 100% 50%;   // Amarelo
--sidebar-primary-foreground: 0 0% 10%;
--sidebar-accent: 0 0% 90%;       // De 18% para 90%
--sidebar-accent-foreground: 0 0% 30%;
--sidebar-border: 0 0% 85%;       // De 22% para 85%
--ring: 54 100% 50%;              // Amarelo
```

## 2. Atualizações de Scrollbar

Mudança no CSS das scrollbars para tema claro:
```css
::-webkit-scrollbar-track: background hsl(0 0% 95%);  // De 14% para 95%
::-webkit-scrollbar-thumb: background hsl(0 0% 70%);  // De 30% para 70%
::-webkit-scrollbar-thumb:hover: background hsl(0 0% 60%);  // De 40% para 60%
```

## 3. Remoção de Citações

### Arquivo: src/App.css
- Remover comentário: `/* Akrivi Gridit — Global styles */`
- Deixar o arquivo vazio ou com um comentário genérico

## 4. Arquivos Afetados

| Arquivo | Mudanças |
|---------|----------|
| `src/index.css` | Atualizar paleta de cores CSS custom (`:root`), scrollbar styling |
| `src/App.css` | Remover citação de "Akrivi Gridit" |

## 5. Impacto Visual

- Interface muda de **Adobe Dark Mode** para **tema claro minimalista**
- Elementos interativos ficam destacados em **amarelo vibrante** em vez de azul
- Texto torna-se legível em fundo claro
- Cards e containers ficam brancos com bordas sutis
- Mantém toda a funcionalidade e estrutura intacta

## 6. Notas Técnicas

- Apenas CSS é modificado, nenhuma lógica TypeScript/React muda
- Todos os componentes Radix UI respeitam as variáveis CSS e se adaptarão automaticamente
- A mudança é global e coerente em toda a interface
- Nenhum arquivo de componente precisa ser alterado

