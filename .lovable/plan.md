

# Correção: Background Dark + Botão Show Grid Invisível

## Problema 1: Background Dark não funciona

A variável CSS `--canvas` está definida como `0 0% 95%` (cinza claro, 95% de luminosidade). Quando o usuário seleciona "Dark", o canvas usa `bg-canvas` que aplica esse cinza claro — visualmente igual ao fundo normal.

**Correção**: Mudar a variável `--canvas` para um valor realmente escuro, como `0 0% 15%` (cinza escuro).

## Problema 2: Botão Show Grid quase invisível

O Switch quando desmarcado usa `bg-input` que é `0 0% 98%` (quase branco), sobre o fundo da sidebar que é `0 0% 98%` (também quase branco). O contraste é zero.

**Correção**: Mudar a variável `--input` para um valor com mais contraste, como `0 0% 90%`, para que switches e inputs fiquem visíveis contra o fundo da sidebar.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | `--canvas: 0 0% 15%` (era 95%); `--input: 0 0% 90%` (era 98%) |

