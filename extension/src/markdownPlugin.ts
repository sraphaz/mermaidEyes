import type MarkdownIt from "markdown-it";
import type { MermaidTheme } from "@mermaidlens/core";
import { applyPreset, getPresetById, getThemeById, getDefaultTheme } from "@mermaidlens/core";
import { injectAssets } from "./injectAssets";

const VIEW_DIAGRAM_LABEL = "View diagram";

interface MermaidLensPluginOptions {
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
  return `<span class="mermaidlens-label">${VIEW_DIAGRAM_LABEL}</span>${html}`;
}

export function markdownPlugin(md: MarkdownIt, options: MermaidLensPluginOptions): void {
  const defaultFence = md.renderer.rules.fence ?? ((tokens, idx, opts, env, self) => self.renderToken(tokens, idx, opts));

  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info !== "mermaid") {
      return defaultFence(tokens, idx, opts, env, self);
    }

    const raw = token.content.trim();
    if (!raw) {
      const empty = `<div class="mermaidlens-diagram mermaidlens-empty"><span class="mermaidlens-label">${VIEW_DIAGRAM_LABEL}</span><p class="mermaidlens-error">Empty Mermaid block.</p></div>`;
      return injectOnce(env, undefined, false) + empty;
    }

    try {
      const themeId = options.getThemeId();
      const presetId = options.getPresetId();
      const diagramOnHover = options.getDiagramOnHover();

      const preset = getPresetById(presetId);
      if (!preset && presetId && presetId !== "none") {
        console.warn(`[MermaidLens] Preset "${presetId}" não encontrado, usando padrão`);
      }

      const theme = getThemeById(themeId) ?? getDefaultTheme();
      if (!theme) {
        console.error(`[MermaidLens] Nenhum tema disponível. Tema solicitado: "${themeId}"`);
      }

      const mermaidCode = applyPreset(raw, preset ?? undefined);
      const dataSrc = escapeAttr(JSON.stringify(mermaidCode));
      const assets = injectOnce(env, theme ?? undefined, diagramOnHover);

      const renderDiv = `<div class="mermaidlens-render" data-mermaid-src="${dataSrc}"></div>`;
      const label = wrapWithLabel("");
      const placeholder = diagramOnHover
        ? `<div class="mermaidlens-placeholder" aria-hidden="true">${VIEW_DIAGRAM_LABEL}</div>`
        : "";

      const hoverClass = diagramOnHover ? " mermaidlens-hover-mode" : "";
      const wrap = diagramOnHover
        ? `<div class="mermaidlens-wrap">${placeholder}${renderDiv}</div>`
        : renderDiv;

      return `${assets}<div class="mermaidlens-diagram${hoverClass}">${label}${wrap}</div>`;
    } catch (error) {
      console.error("[MermaidLens] Erro ao processar diagrama Mermaid:", error);
      const dataSrc = escapeAttr(JSON.stringify(raw));
      const renderDiv = `<div class="mermaidlens-render" data-mermaid-src="${dataSrc}"></div>`;
      return injectOnce(env, undefined, false) + `<div class="mermaidlens-diagram">${wrapWithLabel("")}${renderDiv}</div>`;
    }
  };

  function injectOnce(
    env: { mermaidlensInjected?: boolean },
    theme: MermaidTheme | undefined,
    diagramOnHover: boolean
  ): string {
    if (env.mermaidlensInjected) return "";
    env.mermaidlensInjected = true;
    return injectAssets(theme, { diagramOnHover });
  }
}
