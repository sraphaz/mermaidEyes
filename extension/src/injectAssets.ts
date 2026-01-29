import type { MermaidTheme } from "@mermaideyes/core";
import { getThemeColors } from "@mermaideyes/core";

export interface InjectAssetsOptions {
  diagramOnHover?: boolean;
}

export function injectAssets(theme?: MermaidTheme, opts?: InjectAssetsOptions): string {
  const mermaidConfig = theme?.mermaid ?? {
    theme: "base",
    themeVariables: {}
  };

  const configJson = JSON.stringify({
    startOnLoad: false,
    theme: mermaidConfig.theme,
    themeVariables: mermaidConfig.themeVariables,
    diagramOnHover: opts?.diagramOnHover ?? false
  });

  // Escapa o JSON para uso seguro em atributo HTML
  const escapedConfig = configJson
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const colors = getThemeColors(mermaidConfig.themeVariables);
  const bgColor = colors.background || "#0d1f18";
  const textColor = colors.text || "#e8f4f0";
  const primaryColor = colors.primary || "#1a5c4a";
  const shadowColor = primaryColor + "40";

  return `
<style>
/* Container: cores do tema, tamanho legível, rolagem só quando muito alto */
.mermaideyes-diagram {
  background: ${bgColor};
  color: ${textColor};
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 4px 16px ${shadowColor};
  border: 1px solid ${primaryColor}44;
  min-width: 300px;
  max-width: 960px;
  overflow: auto;
  max-height: 80vh;
}
.mermaideyes-diagram .mermaid {
  color: ${textColor};
  background: transparent;
}
/* SVG: não forçar tamanho para não distorcer; só limitar overflow e mínimo legível */
.mermaideyes-diagram .mermaideyes-render {
  min-width: 280px;
  max-width: 100%;
}
.mermaideyes-diagram svg {
  max-width: 100%;
  height: auto;
}
/* Garante contraste para textos dentro dos diagramas */
.mermaideyes-diagram svg text {
  fill: ${textColor} !important;
}
.mermaideyes-diagram svg .label text {
  fill: ${textColor} !important;
}
/* Melhora legibilidade de elementos específicos */
.mermaideyes-diagram svg .nodeLabel,
.mermaideyes-diagram svg .edgeLabel,
.mermaideyes-diagram svg .cluster-label {
  color: ${textColor} !important;
}
.mermaideyes-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${primaryColor};
  margin-bottom: 8px;
  opacity: 0.9;
}
.mermaideyes-error {
  margin: 0;
  padding: 12px 16px;
  font-size: 0.875rem;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.mermaideyes-empty .mermaideyes-error {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}
.mermaideyes-hover-mode .mermaideyes-label { display: none; }
.mermaideyes-hover-mode .mermaideyes-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  background: ${primaryColor}22;
  border: 1px dashed ${primaryColor}66;
  color: ${primaryColor};
  font-size: 0.875rem;
  font-weight: 500;
}
.mermaideyes-hover-mode .mermaideyes-placeholder:hover { opacity: 0.9; }
.mermaideyes-hover-mode .mermaideyes-render {
  display: none;
  position: absolute;
  z-index: 100;
  left: 0;
  top: 0;
  margin-top: -8px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  max-width: min(90vw, 800px);
  max-height: 80vh;
  overflow: auto;
  background: ${bgColor};
  border: 1px solid ${primaryColor}33;
}
.mermaideyes-hover-mode .mermaideyes-wrap { position: relative; min-height: 44px; }
.mermaideyes-hover-mode .mermaideyes-wrap:hover .mermaideyes-render,
.mermaideyes-hover-mode .mermaideyes-wrap.mermaideyes-reveal .mermaideyes-render { display: block; }
.mermaideyes-edit-link {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  outline: none;
}
.mermaideyes-edit-link:hover .mermaideyes-diagram { opacity: 0.95; }
.mermaideyes-edit-link:focus .mermaideyes-diagram { box-shadow: 0 0 0 2px ${primaryColor}88; }
</style>
<div data-mermaideyes-config="${escapedConfig}" style="display: none;"></div>
`;
}
