import type MarkdownIt from "markdown-it";
import type { MermaidTheme } from "@mermaideyes/core";
import { applyPreset, getPresetById, getThemeById, getDefaultTheme } from "@mermaideyes/core";
import { injectAssets } from "./injectAssets";

const VIEW_DIAGRAM_LABEL = "View diagram";
const EDIT_DIAGRAM_TITLE = "Clique para editar o diagrama";

interface MermaidEyesPluginOptions {
  getThemeId: () => string;
  getPresetId: () => string;
  getDiagramOnHover: () => boolean;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapWithLabel(html: string): string {
  return `<span class="mermaideyes-label">${VIEW_DIAGRAM_LABEL}</span>${html}`;
}

function editDiagramCommandUri(line: number): string {
  const args = encodeURIComponent(JSON.stringify([line]));
  return `command:mermaideyes.editDiagram?${args}`;
}

export function markdownPlugin(md: MarkdownIt, options: MermaidEyesPluginOptions): void {
  const defaultFence = md.renderer.rules.fence ?? ((tokens, idx, opts, env, self) => self.renderToken(tokens, idx, opts));

  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info !== "mermaid") {
      return defaultFence(tokens, idx, opts, env, self);
    }

    const raw = token.content.trim();
    if (!raw) {
      const empty = `<div class="mermaideyes-diagram mermaideyes-empty"><span class="mermaideyes-label">${VIEW_DIAGRAM_LABEL}</span><p class="mermaideyes-error">Empty Mermaid block.</p></div>`;
      return injectOnce(env, undefined, false) + empty;
    }

    try {
      const themeId = options.getThemeId();
      const presetId = options.getPresetId();
      const diagramOnHover = options.getDiagramOnHover();

      const preset = getPresetById(presetId);
      if (!preset && presetId && presetId !== "none") {
        console.warn(`[MermaidEyes] Preset "${presetId}" não encontrado, usando padrão`);
      }

      const theme = getThemeById(themeId) ?? getDefaultTheme();
      if (!theme) {
        console.error(`[MermaidEyes] Nenhum tema disponível. Tema solicitado: "${themeId}"`);
      }

      const mermaidCode = applyPreset(raw, preset ?? undefined);
      const dataSrc = escapeAttr(JSON.stringify(mermaidCode));
      const assets = injectOnce(env, theme ?? undefined, diagramOnHover);

      const startLine = token.map ? token.map[0] : 1;
      const editUri = editDiagramCommandUri(startLine);

      const renderDiv = `<div class="mermaideyes-render" data-mermaid-src="${dataSrc}"></div>`;
      const label = wrapWithLabel("");
      const placeholder = diagramOnHover
        ? `<div class="mermaideyes-placeholder" aria-hidden="true">${VIEW_DIAGRAM_LABEL}</div>`
        : "";

      const hoverClass = diagramOnHover ? " mermaideyes-hover-mode" : "";
      const wrap = diagramOnHover
        ? `<div class="mermaideyes-wrap">${placeholder}${renderDiv}</div>`
        : renderDiv;

      const diagramBlock = `<div class="mermaideyes-diagram${hoverClass}">${label}${wrap}</div>`;
      const clickableBlock = diagramOnHover
        ? diagramBlock
        : `<a class="mermaideyes-edit-link" href="${escapeAttr(editUri)}" title="${escapeAttr(EDIT_DIAGRAM_TITLE)}">${diagramBlock}</a>`;

      return `${assets}${clickableBlock}`;
    } catch (error) {
      console.error("[MermaidEyes] Erro ao processar diagrama Mermaid:", error);
      const dataSrc = escapeAttr(JSON.stringify(raw));
      const renderDiv = `<div class="mermaideyes-render" data-mermaid-src="${dataSrc}"></div>`;
      return injectOnce(env, undefined, false) + `<div class="mermaideyes-diagram">${wrapWithLabel("")}${renderDiv}</div>`;
    }
  };

  function injectOnce(
    env: { mermaideyesInjected?: boolean },
    theme: MermaidTheme | undefined,
    diagramOnHover: boolean
  ): string {
    if (env.mermaideyesInjected) return "";
    env.mermaideyesInjected = true;
    return injectAssets(theme, { diagramOnHover });
  }
}
