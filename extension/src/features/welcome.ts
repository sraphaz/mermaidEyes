import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export async function showWelcomePage(context: vscode.ExtensionContext, forceShow = false): Promise<void> {
  if (!forceShow) {
    const hasShown = context.globalState.get<boolean>("mermaidlens.hasShownWelcome");
    if (hasShown) {
      console.log("[MermaidLens] Página de boas-vindas já foi mostrada. Use o comando 'MermaidLens: Show Welcome Page' para reabrir.");
      return;
    }
  }

  const welcomePath = path.join(context.extensionPath, "media", "welcome.md");
  const welcomeUri = vscode.Uri.file(welcomePath);
  
  // Verifica se o arquivo existe
  if (!fs.existsSync(welcomePath)) {
    const errorMsg = `[MermaidLens] Arquivo de boas-vindas não encontrado: ${welcomePath}`;
    console.error(errorMsg);
    vscode.window.showErrorMessage(`MermaidLens: ${errorMsg}`);
    return;
  }
  
  try {
    console.log(`[MermaidLens] Abrindo página de boas-vindas: ${welcomePath}`);
    const doc = await vscode.workspace.openTextDocument(welcomeUri);

    // Abre o documento
    await vscode.window.showTextDocument(doc, {
      preview: false,
      viewColumn: vscode.ViewColumn.One
    });

    console.log("[MermaidLens] Documento aberto, aguardando para abrir preview...");

    // Aguarda um pouco para garantir que o documento foi aberto
    // e então abre o preview para mostrar os diagramas renderizados
    setTimeout(async () => {
      try {
        console.log("[MermaidLens] Tentando abrir preview ao lado...");
        // Tenta abrir o preview ao lado primeiro (melhor UX)
        await vscode.commands.executeCommand("markdown.showPreviewToSide", welcomeUri);
        console.log("[MermaidLens] Preview aberto com sucesso!");
      } catch (error) {
        console.warn("[MermaidLens] Erro ao abrir preview ao lado, tentando na mesma coluna...", error);
        // Se falhar, tenta abrir o preview na mesma coluna
        try {
          await vscode.commands.executeCommand("markdown.showPreview", welcomeUri);
          console.log("[MermaidLens] Preview aberto na mesma coluna.");
        } catch (err) {
          console.warn("[MermaidLens] Não foi possível abrir o preview automaticamente. Use Ctrl+Shift+V para abrir manualmente.", err);
          // Mostra uma notificação amigável
          vscode.window.showInformationMessage(
            "MermaidLens: Página de boas-vindas aberta! Pressione Ctrl+Shift+V para ver os diagramas renderizados.",
            "Abrir Preview"
          ).then(selection => {
            if (selection === "Abrir Preview") {
              vscode.commands.executeCommand("markdown.showPreview", welcomeUri);
            }
          });
        }
      }
    }, 500);

    if (!forceShow) {
      await context.globalState.update("mermaidlens.hasShownWelcome", true);
    }
  } catch (error) {
    const errorMsg = `Erro ao abrir página de boas-vindas: ${error}`;
    console.error(`[MermaidLens] ${errorMsg}`, error);
    vscode.window.showErrorMessage(`MermaidLens: ${errorMsg}`);
  }
}
