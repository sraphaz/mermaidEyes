# Como rodar o MermaidLens localmente

## Erro que você viu

```
Activating extension 'mermaidlens.mermaidlens-extension' failed: 
Cannot find module '...\extension\dist\extension.js'
```

Isso acontece quando a pasta `extension/dist` não existe — a extensão ainda não foi compilada.

## Correções feitas

1. **Core não gerava `dist`**  
   O `packages/core/tsconfig.json` incluía os arquivos de teste, e o TypeScript não emitia os `.js`.  
   Foi ajustado o `include` para listar só os arquivos de código (sem `__tests__` e `*.test.ts`), assim o `packages/core/dist` passa a ser gerado.

2. **Build completo**  
   Com o core compilando de novo, `npm run build` passa a gerar:
   - `packages/core/dist/` (pacote @mermaidlens/core)
   - `extension/dist/` (incluindo `extension.js`)

## Como rodar agora

### 1. Instalar dependências (se ainda não fez)

```bash
npm install
```

### 2. Compilar

```bash
npm run build
```

Você deve ver algo como:

```
Copiando temas...
✓ Temas copiados
Copiando presets...
✓ Presets copiados
✓ Assets copiados com sucesso!
```

### 3. Abrir no VS Code / Cursor e iniciar a extensão

1. Abra a pasta do projeto no VS Code ou Cursor.
2. Pressione **F5** (ou use **Run > Start Debugging**).

O **Launch Extension** já está configurado com `preLaunchTask: "npm: build"`, então o build roda antes de abrir a janela de desenvolvimento. Se o build falhar, a extensão não sobe e você verá o erro no terminal.

### Comandos úteis na janela de desenvolvimento

- **View with MermaidLens:** abra um arquivo `.md` e use o comando (barra de título do editor ou botão direito) para abrir o preview ao lado.
- **Hover no editor:** passe o mouse sobre um bloco Mermaid no Markdown para ver o diagrama em uma caixa (com cores do tema) e um link para o preview.

### Se aparecerem 3 abas "Untitled" ao abrir o Extension Development Host

A extensão **não abre** nenhum documento na ativação (isso é coberto por teste em `extension/src/__tests__/activation.test.ts`). As abas Untitled costumam vir da **restauração de sessão** do VS Code/Cursor (última janela com editores abertos).

**Opções:**

1. **Usar perfil limpo:** no menu de debug, escolha **"Launch Extension (perfil limpo, sem abas restauradas)"** em vez de "Launch Extension". Isso abre a janela de desenvolvimento com um perfil separado (`.vscode-test/user-data`), sem restaurar editores anteriores.
2. **Fechar as abas:** feche as abas Untitled manualmente (X em cada aba).
3. **Desativar restauração:** em Configurações, procure por "restore" ou "restaurar" e desative a opção de restaurar editores/janelas ao abrir.

### Se ainda der erro de `extension.js` não encontrado

1. Rode o build manualmente na raiz do projeto:
   ```bash
   npm run build
   ```
2. Confira se existem:
   - `extension/dist/extension.js`
   - `packages/core/dist/index.js`
3. Se não existirem, apague os caches e compile de novo:
   ```bash
   npm run clean
   npm run build
   ```

Depois disso, use **F5** de novo para rodar a extensão localmente.
