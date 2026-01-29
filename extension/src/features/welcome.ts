import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

let welcomeOpening = false;

export async function showWelcomePage(context: vscode.ExtensionContext, forceShow = false): Promise<void> {
  if (welcomeOpening) return;
  if (!forceShow) {
    const hasShown = context.globalState.get<boolean>("mermaideyes.hasShownWelcome");
    if (hasShown) {
      console.log("[MermaidEyes] Página de boas-vindas já foi mostrada. Use o comando 'MermaidEyes: Show Welcome Page' para reabrir.");
      return;
    }
  }
  welcomeOpening = true;

  const welcomePath = path.join(context.extensionPath, "media", "welcome.md");
  const welcomeUri = vscode.Uri.file(welcomePath);
  
  if (!fs.existsSync(welcomePath)) {
    const errorMsg = `[MermaidEyes] Arquivo de boas-vindas não encontrado: ${welcomePath}`;
    console.error(errorMsg);
    vscode.window.showErrorMessage(`MermaidEyes: ${errorMsg}`);
    return;
  }
  
  try {
    console.log(`[MermaidEyes] Abrindo página de boas-vindas: ${welcomePath}`);
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
      console.log("[MermaidEyes] Preview aberto ao lado.");
    } catch (e) {
      console.warn("[MermaidEyes] markdown.showPreviewToSide falhou:", e);
      void vscode.window.showInformationMessage(
        "MermaidEyes: Pressione Ctrl+Shift+V para abrir o preview.",
        "Abrir Preview"
      ).then((selection) => {
        if (selection === "Abrir Preview") {
          void vscode.commands.executeCommand("markdown.showPreviewToSide");
        }
      });
    }

    if (!forceShow) {
      await context.globalState.update("mermaideyes.hasShownWelcome", true);
    }
  } catch (error) {
    const errorMsg = `Erro ao abrir página de boas-vindas: ${error}`;
    console.error(`[MermaidEyes] ${errorMsg}`, error);
    vscode.window.showErrorMessage(`MermaidEyes: ${errorMsg}`);
  } finally {
    welcomeOpening = false;
  }
}
