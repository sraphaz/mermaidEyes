import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

let welcomeOpening = false;

export async function showWelcomePage(context: vscode.ExtensionContext, forceShow = false): Promise<void> {
  if (welcomeOpening) return;
  if (!forceShow) {
    const hasShown = context.globalState.get<boolean>("mermaidlens.hasShownWelcome");
    if (hasShown) {
      console.log("[MermaidLens] Página de boas-vindas já foi mostrada. Use o comando 'MermaidLens: Show Welcome Page' para reabrir.");
      return;
    }
  }
  welcomeOpening = true;

  const welcomePath = path.join(context.extensionPath, "media", "welcome.md");
  const welcomeUri = vscode.Uri.file(welcomePath);
  
  if (!fs.existsSync(welcomePath)) {
    const errorMsg = `[MermaidLens] Arquivo de boas-vindas não encontrado: ${welcomePath}`;
    console.error(errorMsg);
    vscode.window.showErrorMessage(`MermaidLens: ${errorMsg}`);
    return;
  }
  
  try {
    console.log(`[MermaidLens] Abrindo página de boas-vindas: ${welcomePath}`);
    const doc = await vscode.workspace.openTextDocument(welcomeUri);

    // 1) Abrir o documento no editor (preview: false para não reutilizar aba como "preview")
    await vscode.window.showTextDocument(doc, {
      preview: false,
      viewColumn: vscode.ViewColumn.One,
      preserveFocus: false
    });

    // 2) Abrir o preview ao lado uma única vez (evita abas/untitled extras)
    try {
      await vscode.commands.executeCommand("markdown.showPreviewToSide");
      console.log("[MermaidLens] Preview aberto ao lado.");
    } catch (e) {
      console.warn("[MermaidLens] markdown.showPreviewToSide falhou:", e);
      void vscode.window.showInformationMessage(
        "MermaidLens: Pressione Ctrl+Shift+V para abrir o preview.",
        "Abrir Preview"
      ).then((selection) => {
        if (selection === "Abrir Preview") {
          void vscode.commands.executeCommand("markdown.showPreviewToSide");
        }
      });
    }

    if (!forceShow) {
      await context.globalState.update("mermaidlens.hasShownWelcome", true);
    }
  } catch (error) {
    const errorMsg = `Erro ao abrir página de boas-vindas: ${error}`;
    console.error(`[MermaidLens] ${errorMsg}`, error);
    vscode.window.showErrorMessage(`MermaidLens: ${errorMsg}`);
  } finally {
    welcomeOpening = false;
  }
}
