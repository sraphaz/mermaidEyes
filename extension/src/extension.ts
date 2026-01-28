import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { loadPresets, loadThemes } from "@mermaidlens/core";
import { showWelcomePage } from "./features/welcome";
import { markdownPlugin } from "./markdownPlugin";

function getThemeSetting(): string {
  return vscode.workspace.getConfiguration().get<string>("mermaidlens.theme", "ocean");
}

function getPresetSetting(): string {
  return vscode.workspace.getConfiguration().get<string>("mermaidlens.preset", "none");
}

function getDiagramOnHoverSetting(): boolean {
  return vscode.workspace.getConfiguration().get<boolean>("mermaidlens.diagramOnHover", false);
}

export function activate(context: vscode.ExtensionContext): unknown {
  // Em desenvolvimento: usa packages/ do monorepo
  // Em produção: usa packages/ dentro da extensão (se copiados durante build)
  const repoRoot = path.resolve(context.extensionPath, "..");
  const devThemeRoot = path.join(repoRoot, "packages", "themes");
  const devPresetRoot = path.join(repoRoot, "packages", "presets");
  
  // Tenta primeiro o caminho de desenvolvimento, depois o caminho de produção
  const themeRoot = fs.existsSync(devThemeRoot) 
    ? devThemeRoot 
    : path.join(context.extensionPath, "packages", "themes");
  const presetRoot = fs.existsSync(devPresetRoot)
    ? devPresetRoot
    : path.join(context.extensionPath, "packages", "presets");

  const loadedThemes = loadThemes(themeRoot);
  const loadedPresets = loadPresets(presetRoot);
  
  if (loadedThemes.length === 0) {
    console.warn(`[MermaidLens] Nenhum tema carregado de ${themeRoot}`);
  } else {
    console.log(`[MermaidLens] ${loadedThemes.length} tema(s) carregado(s)`);
  }
  
  if (loadedPresets.length === 0) {
    console.warn(`[MermaidLens] Nenhum preset carregado de ${presetRoot}`);
  } else {
    console.log(`[MermaidLens] ${loadedPresets.length} preset(s) carregado(s)`);
  }
  
  // Mostra a página de boas-vindas após a inicialização
  // Usa setTimeout para garantir que o VS Code está pronto
  void (async () => {
    // Aguarda um pouco para garantir que o VS Code está totalmente inicializado
    await new Promise(resolve => setTimeout(resolve, 1500));
    await showWelcomePage(context);
  })();

  context.subscriptions.push(
    vscode.commands.registerCommand("mermaidlens.refresh", async () => {
      await vscode.commands.executeCommand("markdown.preview.refresh");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mermaidlens.showWelcome", async () => {
      await showWelcomePage(context, true);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("mermaidlens.theme") ||
        event.affectsConfiguration("mermaidlens.preset") ||
        event.affectsConfiguration("mermaidlens.diagramOnHover")
      ) {
        void vscode.commands.executeCommand("markdown.preview.refresh");
      }
    })
  );

  return {
    extendMarkdownIt(md: import("markdown-it")) {
      markdownPlugin(md, {
        getThemeId: getThemeSetting,
        getPresetId: getPresetSetting,
        getDiagramOnHover: getDiagramOnHoverSetting
      });
      return md;
    }
  };
}

export function deactivate(): void {}
