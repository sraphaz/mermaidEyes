import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { loadPresets, loadThemes } from "@mermaideyes/core";
import { showWelcomePage } from "./features/welcome";
import { markdownPlugin } from "./markdownPlugin";
import { registerMermaidHover } from "./mermaidHover";

function getThemeSetting(): string {
  return vscode.workspace.getConfiguration().get<string>("mermaideyes.theme", "ocean");
}

function getPresetSetting(): string {
  return vscode.workspace.getConfiguration().get<string>("mermaideyes.preset", "none");
}

function getDiagramOnHoverSetting(): boolean {
  return vscode.workspace.getConfiguration().get<boolean>("mermaideyes.diagramOnHover", true);
}

export function activate(context: vscode.ExtensionContext): unknown {
  const output = vscode.window.createOutputChannel("MermaidEyes");
  output.appendLine("[MermaidEyes] activate() started");

  try {
    // Raiz da extensão a partir do código (dist/extension.js → __dirname = dist, raiz = ..)
    const extensionRoot = path.resolve(__dirname, "..");
    const prodThemeRoot = path.resolve(extensionRoot, "packages", "themes");
    const prodPresetRoot = path.resolve(extensionRoot, "packages", "presets");
    const devThemeRoot = path.resolve(extensionRoot, "..", "packages", "themes");
    const devPresetRoot = path.resolve(extensionRoot, "..", "packages", "presets");
    const hasDevThemes = fs.existsSync(path.join(devThemeRoot, "ocean", "theme.json"));
    const hasDevPresets = fs.existsSync(path.join(devPresetRoot, "none", "preset.json"));

    const themeRoot = hasDevThemes ? devThemeRoot : prodThemeRoot;
    const presetRoot = hasDevPresets ? devPresetRoot : prodPresetRoot;

    output.appendLine(`extensionRoot: ${extensionRoot}`);
    output.appendLine(`themeRoot: ${themeRoot} (exists: ${fs.existsSync(themeRoot)})`);
    output.appendLine(`presetRoot: ${presetRoot} (exists: ${fs.existsSync(presetRoot)})`);

    const loadedThemes = loadThemes(themeRoot);
    const loadedPresets = loadPresets(presetRoot);

    output.appendLine(`themes: ${loadedThemes.length}, presets: ${loadedPresets.length}`);

    if (loadedThemes.length === 0) {
      output.appendLine(`[WARN] Nenhum tema carregado. Hover e preview podem falhar.`);
      console.warn(`[MermaidEyes] Nenhum tema carregado de ${themeRoot}`);
    } else {
      console.log(`[MermaidEyes] ${loadedThemes.length} tema(s) carregado(s)`);
    }

    if (loadedPresets.length === 0) {
      output.appendLine(`[WARN] Nenhum preset carregado.`);
      console.warn(`[MermaidEyes] Nenhum preset carregado de ${presetRoot}`);
    } else {
      console.log(`[MermaidEyes] ${loadedPresets.length} preset(s) carregado(s)`);
    }

    const welcomePath = path.join(extensionRoot, "media", "welcome.md");
    output.appendLine(`welcome: ${welcomePath} (exists: ${fs.existsSync(welcomePath)})`);

    // Na primeira vez após instalar, abre a welcome + preview ao lado (uma única vez)
    const hasShownWelcome = context.globalState.get<boolean>("mermaideyes.hasShownWelcome");
    if (!hasShownWelcome) {
      void (async () => {
        await new Promise((r) => setTimeout(r, 1200));
        await showWelcomePage(context, false, extensionRoot);
      })();
    }

    context.subscriptions.push(
      vscode.commands.registerCommand("mermaideyes.refresh", async () => {
        await vscode.commands.executeCommand("markdown.preview.refresh");
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("mermaideyes.viewWithMermaidEyes", async (resourceUri?: vscode.Uri) => {
        let doc: vscode.TextDocument | undefined;
        if (resourceUri?.scheme === "file" && resourceUri.fsPath.endsWith(".md")) {
          doc = await vscode.workspace.openTextDocument(resourceUri);
        } else {
          const editor = vscode.window.activeTextEditor;
          if (editor?.document.languageId === "markdown") {
            doc = editor.document;
          }
        }
        if (doc) {
          await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preserveFocus: false });
          await vscode.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
        } else {
          void vscode.window.showInformationMessage(
            "Abra um arquivo Markdown ou clique com o botão direito em um .md no explorador e escolha 'View with MermaidEyes'."
          );
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("mermaideyes.showWelcome", async () => {
        await showWelcomePage(context, true, extensionRoot);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("mermaideyes.editDiagram", async (args: unknown) => {
        const line = Array.isArray(args) && typeof args[0] === "number" ? args[0] : undefined;
        if (line === undefined) return;
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          void vscode.window.showInformationMessage("Abra o arquivo Markdown no editor para editar o diagrama.");
          return;
        }
        const position = new vscode.Position(Math.max(0, line - 1), 0);
        await editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.AtTop);
        editor.selection = new vscode.Selection(position, position);
        await vscode.window.showTextDocument(editor.document, editor.viewColumn);
      })
    );

    context.subscriptions.push(registerMermaidHover(context));

    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (
          event.affectsConfiguration("mermaideyes.theme") ||
          event.affectsConfiguration("mermaideyes.preset") ||
          event.affectsConfiguration("mermaideyes.diagramOnHover")
        ) {
          void vscode.commands.executeCommand("markdown.preview.refresh");
        }
      })
    );

    // Preview sempre mostra diagrama renderizado (sem placeholder). O toggle diagramOnHover
    // é só para uso futuro no editor/código, não no preview.
    output.appendLine("[MermaidEyes] activate() completed");
    return {
      extendMarkdownIt(md: import("markdown-it")) {
        markdownPlugin(md, {
          getThemeId: getThemeSetting,
          getPresetId: getPresetSetting,
          getDiagramOnHover: () => false
        });
        return md;
      }
    };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    output.appendLine(`[MermaidEyes] ERROR in activate(): ${err}`);
    output.show(true);
    throw e;
  }
}

export function deactivate(): void {}
