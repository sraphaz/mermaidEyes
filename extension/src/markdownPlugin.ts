import type MarkdownIt from "markdown-it";
import type { MermaidTheme } from "@mermaidlens/core";
import { applyPreset, getPresetById, getThemeById, getDefaultTheme } from "@mermaidlens/core";
import { injectAssets } from "./injectAssets";

const VIEW_DIAGRAM_LABEL = "View diagram";

interface MermaidLensPluginOptions {
  getThemeId: () => string;
  getPresetId: () => string;
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
      return injectOnce(env, undefined) + empty;
    }

    try {
      const themeId = options.getThemeId();
      const presetId = options.getPresetId();

      const preset = getPresetById(presetId);
      if (!preset && presetId) {
        console.warn(`[MermaidLens] Preset "${presetId}" não encontrado, usando padrão`);
      }

      const theme = getThemeById(themeId) ?? getDefaultTheme();
      if (!theme) {
        console.error(`[MermaidLens] Nenhum tema disponível. Tema solicitado: "${themeId}"`);
        const escapedCode = md.utils.escapeHtml(raw);
        return injectOnce(env, undefined) + `<div class="mermaidlens-diagram">${wrapWithLabel(`<div class="mermaid">${escapedCode}</div>`)}</div>`;
      }

      const mermaidCode = applyPreset(raw, preset);
      const escapedCode = md.utils.escapeHtml(mermaidCode);
      const assets = injectOnce(env, theme);

      return `${assets}<div class="mermaidlens-diagram">${wrapWithLabel(`<div class="mermaid">${escapedCode}</div>`)}</div>`;
    } catch (error) {
      console.error("[MermaidLens] Erro ao processar diagrama Mermaid:", error);
      const escapedCode = md.utils.escapeHtml(raw);
      return injectOnce(env, undefined) + `<div class="mermaidlens-diagram">${wrapWithLabel(`<div class="mermaid">${escapedCode}</div>`)}</div>`;
    }
  };

  function injectOnce(env: { mermaidlensInjected?: boolean }, theme: MermaidTheme | undefined): string {
    if (env.mermaidlensInjected) return "";
    env.mermaidlensInjected = true;
    return injectAssets(theme);
  }
}
