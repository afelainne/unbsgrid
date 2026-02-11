
# Sistema de Presets de Configurações de Geometria para unbsgrid

## Visão Geral
Implementar um sistema completo de **salvar e carregar presets** de configurações de geometria, permitindo que designers reutilizem suas configurações padrão (como "Minimalista", "Detalhado", "Proporções Áureas", etc.).

## 1. Estrutura de Dados

### Nova Interface: `GeometryPreset`
```typescript
interface GeometryPreset {
  id: string;
  name: string;
  description?: string;
  geometryOptions: GeometryOptions;
  geometryStyles: GeometryStyles;
  clearspaceValue: number;
  clearspaceUnit: ClearspaceUnit;
  showGrid: boolean;
  gridSubdivisions: number;
  createdAt: number;
}
```

### Presets Padrão (Built-in)
Criar 4 presets predefinidos como exemplos:
- **"Minimalista"**: Apenas bounding rects e center lines (limpo e simples)
- **"Proporções Áureas"**: Golden ratio, golden spiral, third lines (para design harmônico)
- **"Análise Completa"**: Todos os geometry options ativados (máximo detalhe)
- **"Construção Técnica"**: Bezier handles, isometric grid, center lines (para análise estrutural)

## 2. Funcionalidades Principais

### 2.1 UI para Gerenciar Presets
Novo painel "Presets" na sidebar com:
- **Seletor de Presets Ativo**: Dropdown mostrando o preset atualmente carregado
- **Botão "Salvar Preset Atual"**: Abre um dialog para nomear/descrever
- **Botão "Carregar Preset"**: Abre um dialog com lista de presets salvos
- **Botão "Deletar Preset"**: Próximo ao nome do preset ativo (com confirmação)
- **Indicador Visual**: Mostra se a configuração atual foi modificada após carregar um preset

### 2.2 LocalStorage Persistence
- Salvar presets no `localStorage` com chave `'unbsgrid-presets'` (JSON stringified)
- Carregar presets ao inicializar o app
- Validação de dados para prevenir corrupção

### 2.3 Dialog para Salvar Preset
- Campo de texto para nome do preset (obrigatório)
- Campo de textarea para descrição (opcional)
- Botões: "Salvar" e "Cancelar"
- Validação: Nome não pode estar vazio, não pode duplicar nomes existentes

### 2.4 Dialog para Carregar/Deletar Presets
- Lista de presets (built-in + salvos)
- Indicador visual para presets built-in (badge "Padrão")
- Cada item mostra: Nome, Descrição, Data de criação
- Ações: Botão para carregar, botão para deletar (apenas para presets salvos)
- Confirmação antes de deletar

## 3. Implementação Técnica

### 3.1 Novo Arquivo: `src/lib/preset-engine.ts`
```typescript
// Funções auxiliares para gerenciar presets
- loadPresetsFromStorage(): GeometryPreset[]
- savePresetsToStorage(presets: GeometryPreset[]): void
- createPreset(config): GeometryPreset
- deletePreset(id: string): void
- getBuiltinPresets(): GeometryPreset[]
- validatePreset(preset: any): boolean
```

### 3.2 Componentes Novos
- **`PresetManager.tsx`**: Painel com dropdown e botões
- **`SavePresetDialog.tsx`**: Dialog para salvar novo preset
- **`LoadPresetDialog.tsx`**: Dialog para carregar/deletar presets

### 3.3 Alterações em `src/pages/Index.tsx`
- Adicionar estado para presets: `const [presets, setPresets] = useState<GeometryPreset[]>([...]);`
- Adicionar estado para preset ativo: `const [activePresetId, setActivePresetId] = useState<string | null>(null);`
- Adicionar função para aplicar preset: `applyPreset(preset)`
- Integrar novos diálogos na UI
- Chamar `loadPresetsFromStorage()` no `useEffect` de inicialização

### 3.4 Alterações em `src/components/PreviewCanvas.tsx`
- Sem alterações necessárias (recebe props já processadas)

## 4. Fluxo de Usuário

1. **Usar Presets Padrão**:
   - App carrega com "Análise Completa" como padrão
   - Usuário clica em "Carregar Preset"
   - Seleciona um preset (ex: "Minimalista")
   - Todas as configs são aplicadas instantaneamente

2. **Criar Novo Preset**:
   - Usuário ajusta geometries, cores, opacidades manualmente
   - Clica em "Salvar Preset Atual"
   - Nomeeia como "Meu Estilo Corporativo"
   - Preset é salvo no localStorage

3. **Reutilizar Preset**:
   - Carrega novo SVG
   - Clica em "Carregar Preset"
   - Seleciona "Meu Estilo Corporativo"
   - Todas as configs são aplicadas ao novo logo

## 5. Presets Padrão Detalhados

### "Minimalista"
- boundingRects: ✓ (vermelho, 0.6 opacidade)
- centerLines: ✓ (laranja, 0.5 opacidade)
- Todos outros: ✗

### "Proporções Áureas"
- goldenRatio: ✓
- goldenSpiral: ✓
- thirdLines: ✓
- typographicProportions: ✓
- Todos outros: ✗

### "Análise Completa"
- Todos geometry types: ✓

### "Construção Técnica"
- bezierHandles: ✓
- isometricGrid: ✓
- centerLines: ✓
- boundingRects: ✓
- Todos outros: ✗

## 6. Arquivos a Serem Criados/Modificados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/lib/preset-engine.ts` | Novo | Engine de presets com localStorage |
| `src/components/PresetManager.tsx` | Novo | Painel de gerenciamento de presets |
| `src/components/SavePresetDialog.tsx` | Novo | Dialog para salvar presets |
| `src/components/LoadPresetDialog.tsx` | Novo | Dialog para carregar/deletar |
| `src/pages/Index.tsx` | Modificado | Integrar presets na UI |

## 7. Detalhes de Implementação

### localStorage Structure
```json
{
  "presets": [
    {
      "id": "preset-1738123456789",
      "name": "Minimalista",
      "description": "Apenas bounding rects e center lines",
      "isBuiltin": true,
      "geometryOptions": {...},
      "geometryStyles": {...},
      "clearspaceValue": 1,
      "clearspaceUnit": "logomark",
      "showGrid": false,
      "gridSubdivisions": 8,
      "createdAt": 1738123456789
    }
  ]
}
```

### Comportamento de Modificação
- Quando usuário muda qualquer configuração, mostrar indicador de "Modificado"
- Opção de "Reverter para Preset" para descartar mudanças

## 8. Benefícios
✓ Reutilização rápida de configurações padrão
✓ Consistência em análises de múltiplas marcas
✓ Presets built-in guiam novos usuários
✓ Persistência sem backend (localStorage)
✓ Fluxo intuitivo e amigável
