# Correção: Página de Boas-Vindas Não Abrindo

## 🔍 Problema Identificado

Quando você pressionava F5 para testar a extensão, apenas uma nova janela do VS Code abria, mas a página de boas-vindas não era exibida.

### Causa Raiz

1. **Activation Event**: A extensão só era ativada quando um arquivo Markdown era aberto (`onLanguage:markdown`)
2. **Timing**: Mesmo quando ativada, tentava abrir a página muito cedo, antes do VS Code estar totalmente pronto
3. **Falta de Logs**: Não havia logs suficientes para diagnosticar o problema

## ✅ Correções Implementadas

### 1. **Novo Activation Event**
- Adicionado `"onStartupFinished"` aos `activationEvents`
- Agora a extensão é ativada automaticamente quando o VS Code termina de inicializar
- Não precisa mais abrir um arquivo Markdown primeiro

### 2. **Delay na Abertura**
- Adicionado delay de 1.5 segundos antes de tentar abrir a página
- Garante que o VS Code está totalmente inicializado
- Usa async/await para melhor controle

### 3. **Logs Detalhados**
- Adicionados logs em cada etapa do processo:
  - Quando tenta abrir o arquivo
  - Quando o documento é aberto
  - Quando tenta abrir o preview
  - Erros detalhados se algo falhar

### 4. **Validação de Arquivo**
- Verifica se o arquivo `welcome.md` existe antes de tentar abrir
- Mostra mensagem de erro clara se o arquivo não for encontrado

### 5. **Notificação Amigável**
- Se o preview não abrir automaticamente, mostra uma notificação
- Oferece botão para abrir o preview manualmente

## 📋 Como Testar Agora

1. **Build da extensão**:
   ```bash
   npm run build
   ```

2. **Pressione F5** no VS Code/Cursor

3. **O que deve acontecer**:
   - Uma nova janela do VS Code abre (Extension Development Host)
   - Após ~1.5 segundos, a página `welcome.md` abre automaticamente
   - Após mais ~0.5 segundos, o preview abre ao lado mostrando os diagramas

4. **Verificar logs**:
   - Abra o Developer Tools: `Help > Toggle Developer Tools`
   - Procure por mensagens começando com `[MermaidLens]`
   - Você deve ver logs como:
     - `[MermaidLens] X tema(s) carregado(s)`
     - `[MermaidLens] X preset(s) carregado(s)`
     - `[MermaidLens] Abrindo página de boas-vindas: ...`
     - `[MermaidLens] Documento aberto, aguardando para abrir preview...`
     - `[MermaidLens] Preview aberto com sucesso!`

5. **Se não funcionar**:
   - Verifique os logs no Developer Tools
   - Tente o comando manual: `Ctrl+Shift+P` → "MermaidLens: Show Welcome Page"

## 🔧 Arquivos Modificados

- `extension/package.json` - Adicionado `onStartupFinished` aos activationEvents
- `extension/src/extension.ts` - Adicionado delay antes de chamar showWelcomePage
- `extension/src/features/welcome.ts` - Melhorado com logs, validação e tratamento de erros

## 📝 Notas Importantes

- O delay de 1.5 segundos é necessário para garantir que o VS Code está pronto
- Se a página já foi mostrada antes, não será mostrada automaticamente novamente
- Use o comando "MermaidLens: Show Welcome Page" para forçar a exibição
- Os logs no console ajudam a diagnosticar qualquer problema

## 🎯 Resultado Esperado

Agora, quando você pressionar F5:
1. ✅ Nova janela do VS Code abre
2. ✅ Após ~1.5s, a página de boas-vindas abre automaticamente
3. ✅ Após ~0.5s adicional, o preview abre ao lado
4. ✅ Os diagramas Mermaid são renderizados e visíveis
