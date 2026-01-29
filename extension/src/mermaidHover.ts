import * as vscode from "vscode";
import * as zlib from "zlib";
import { scanMermaid, getThemeById, getDefaultTheme, getThemeColors } from "@mermaidlens/core";

const MAX_CODE_LENGTH_FOR_IMAGE = 2500;
const PREVIEW_CMD = "markdown.showPreviewToSide";
const KROKI_MERMAID_SVG = "https://kroki.io/mermaid/svg";

function positionToOffset(document: vscode.TextDocument, position: vscode.Position): number {
  return document.offsetAt(position);
}

function findMermaidBlockAt(
  document: vscode.TextDocument,
  position: vscode.Position
): { code: string } | null {
  const text = document.getText();
  const offset = positionToOffset(document, position);
  const blocks = scanMermaid(text);
  for (const block of blocks) {
    if (offset >= block.start && offset <= block.end) {
      return { code: block.code };
    }
  }
  return null;
}

/** Injeta o tema atual no código Mermaid para o Kroki renderizar com as cores do tema. */
function codeWithThemeInit(code: string): string {
  const themeId = vscode.workspace.getConfiguration().get<string>("mermaidlens.theme", "ocean");
  const theme = getThemeById(themeId) ?? getDefaultTheme();
  if (!theme?.mermaid?.themeVariables || Object.keys(theme.mermaid.themeVariables).length === 0) {
    return code;
  }
  const init = {
    theme: theme.mermaid.theme || "base",
    themeVariables: theme.mermaid.themeVariables,
  };
  const initBlock = `%%{init: ${JSON.stringify(init)}}%%\n`;
  return initBlock + code;
}

function encodeForKroki(code: string): string | null {
  try {
    const withTheme = codeWithThemeInit(code);
    const deflated = zlib.deflateSync(Buffer.from(withTheme, "utf8"), { level: 9 });
    return deflated
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return null;
  }
}

/** Cores padrão do tema Ocean (fallback se tema não carregar no hover). */
const FALLBACK_COLORS = {
  background: "#0d1f18",
  text: "#e8f4f0",
  primary: "#1a5c4a",
  border: "#2a7a5f",
};

function getHoverBoxColors(): typeof FALLBACK_COLORS {
  const themeId = vscode.workspace.getConfiguration().get<string>("mermaidlens.theme", "ocean");
  const theme = getThemeById(themeId) ?? getDefaultTheme();
  const colors = getThemeColors(theme?.mermaid?.themeVariables);
  return {
    background: colors.background || FALLBACK_COLORS.background,
    text: colors.text || FALLBACK_COLORS.text,
    primary: colors.primary || FALLBACK_COLORS.primary,
    border: colors.border || FALLBACK_COLORS.border,
  };
}

function buildHoverBoxStyle(): string {
  const c = getHoverBoxColors();
  return [
    `background-color: ${c.background} !important`,
    `color: ${c.text} !important`,
    `border: 2px solid ${c.border} !important`,
    `border-radius: 12px`,
    `padding: 14px`,
    `box-shadow: 0 4px 20px ${c.primary}66`,
  ].join("; ");
}

export function registerMermaidHover(_context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.languages.registerHoverProvider(
    { language: "markdown" },
    {
      provideHover(document, position) {
        const result = findMermaidBlockAt(document, position);
        if (!result) return null;

        const { code } = result;
        const c = getHoverBoxColors();
        const boxStyle = buildHoverBoxStyle();
        const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, "&quot;");

        const md = new vscode.MarkdownString();
        md.isTrusted = true;
        md.supportHtml = true;

        const encoded =
          code.length <= MAX_CODE_LENGTH_FOR_IMAGE ? encodeForKroki(code) : null;

        md.appendMarkdown(`<div style="${esc(boxStyle)}">\n\n`);
        md.appendMarkdown(`<strong style="color: ${c.text} !important">Diagrama Mermaid</strong>\n\n`);

        if (encoded) {
          const imgUrl = `${KROKI_MERMAID_SVG}/${encoded}`;
          const escapedUrl = imgUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
          md.appendMarkdown(
            `<div style="max-height: 65vh; overflow: auto; background-color: ${c.background}; border-radius: 8px;"><img src="${escapedUrl}" alt="Diagrama" style="display: block; max-width: 520px; min-width: 280px; height: auto;" /></div>\n\n`
          );
        }

        md.appendMarkdown(
          `[Abrir preview com MermaidLens](command:${PREVIEW_CMD})`
        );
        md.appendMarkdown("\n\n</div>");

        return new vscode.Hover(md);
      }
    }
  );
}
