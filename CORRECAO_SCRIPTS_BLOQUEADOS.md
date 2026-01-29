# Correção: Scripts Bloqueados no Preview do Markdown

## 🔍 Problema Identificado

O VS Code estava bloqueando scripts inline no preview do Markdown por questões de segurança, mostrando o aviso:
- **"Some content has been disabled in this document"**
- Os diagramas Mermaid não eram renderizados, aparecendo apenas como código texto

### Causa Raiz

O VS Code bloqueia scripts inline (`<script>`) no preview do Markdown por segurança. Scripts devem ser registrados através da API oficial do VS Code.

## ✅ Solução Implementada

### 1. **Script Separado e Registrado**
- Criado arquivo `extension/media/mermaid-init.js` com toda a lógica de inicialização do Mermaid
- Registrado no `package.json` usando `"markdown.previewScripts"`:
  ```json
  "markdown.previewScripts": [
    "./media/mermaid-init.js"
  ]
  ```
- O VS Code carrega este script automaticamente de forma segura

### 2. **Remoção de Scripts Inline**
- Removidos todos os `<script>` tags inline do `injectAssets.ts`
- Mantidos apenas estilos CSS e elemento de configuração

### 3. **Configuração via Data Attributes**
- A configuração do tema é passada através de um elemento `<div>` com `data-mermaideyes-config`
- O script JavaScript lê essa configuração e aplica ao Mermaid
- Escape seguro de JSON para evitar problemas de segurança

### 4. **Melhorias no Script**
- Carregamento assíncrono do Mermaid do CDN
- Observer de mutações do DOM para renderizar novos diagramas dinamicamente
- Tratamento robusto de erros
- Logs informativos no console

## 📋 Arquivos Modificados

1. **`extension/media/mermaid-init.js`** (NOVO)
   - Script de inicialização do Mermaid
   - Carrega Mermaid do CDN
   - Lê configuração do tema
   - Renderiza diagramas automaticamente

2. **`extension/src/injectAssets.ts`**
   - Removidos scripts inline
   - Mantidos apenas estilos CSS
   - Adicionado elemento de configuração com data attribute

3. **`extension/package.json`**
   - Adicionado `"markdown.previewScripts"` para registrar o script

4. **`extension/src/markdownPlugin.ts`**
   - Ajuste menor na lógica de injeção de assets

## 🧪 Como Testar

1. **Build da extensão**:
   ```bash
   npm run build
   ```

2. **Pressione F5** para testar

3. **Abra a página de boas-vindas**:
   - Deve abrir automaticamente após ~1.5s
   - Ou use o comando: `Ctrl+Shift+P` → "MermaidLens: Show Welcome Page"

4. **Verifique o preview**:
   - O preview deve abrir ao lado mostrando os diagramas renderizados
   - **NÃO deve aparecer** o aviso "Some content has been disabled"
   - Os diagramas devem ser renderizados como gráficos, não como código

5. **Verificar logs** (opcional):
   - Abra Developer Tools: `Help > Toggle Developer Tools`
   - Procure por mensagens `[MermaidLens]` no console
   - Deve ver: `[MermaidLens] X diagrama(s) renderizado(s)`

## 🎯 Resultado Esperado

✅ **Antes (Problema)**:
- Aviso de segurança no preview
- Diagramas aparecem como código texto
- Scripts bloqueados

✅ **Depois (Corrigido)**:
- Sem avisos de segurança
- Diagramas renderizados corretamente
- Scripts carregados de forma segura via API do VS Code

## 🔒 Segurança

- Scripts agora são carregados através da API oficial do VS Code
- Não há mais scripts inline que podem ser bloqueados
- Configuração é passada de forma segura via data attributes
- Escape adequado de JSON para prevenir XSS

## 📝 Notas Técnicas

- O script `mermaid-init.js` é carregado uma vez por preview
- Usa MutationObserver para detectar novos diagramas adicionados dinamicamente
- Carrega Mermaid do CDN apenas quando necessário
- Suporta múltiplos diagramas na mesma página
- Respeita a configuração de tema do usuário
