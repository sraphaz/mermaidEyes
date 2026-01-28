import path from "path";
import * as vscode from "vscode";
import { loadPresets, loadThemes } from "@mermaidlens/core";
import { showWelcomePage } from "./features/welcome";
import { markdownPlugin } from "./markdownPlugin";

function getThemeSetting(): string {
  return vscode.workspace.getConfiguration().get<string>("mermaidlens.theme", "ocean");
}

function getPresetSetting(): string {
  return vscode.workspace.getConfiguration().get<string>("mermaidlens.preset", "architecture");
}

export function activate(context: vscode.ExtensionContext): unknown {
  const repoRoot = path.resolve(context.extensionPath, "..");
  const themeRoot = path.join(repoRoot, "packages", "themes");
  const presetRoot = path.join(repoRoot, "packages", "presets");

  loadThemes(themeRoot);
  loadPresets(presetRoot);
  void showWelcomePage(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("mermaidlens.refresh", async () => {
      await vscode.commands.executeCommand("markdown.preview.refresh");
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("mermaidlens.theme") || event.affectsConfiguration("mermaidlens.preset")) {
        void vscode.commands.executeCommand("markdown.preview.refresh");
      }
    })
  );

  return {
    extendMarkdownIt(md: import("markdown-it")) {
      markdownPlugin(md, {
        getThemeId: getThemeSetting,
        getPresetId: getPresetSetting
      });
      return md;
    }
  };
}

export function deactivate(): void {}
