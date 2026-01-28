import type { MermaidTheme } from "@mermaidlens/core";

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

  // Extrai cores do tema para usar no CSS
  const bgColor = mermaidConfig.themeVariables?.background || mermaidConfig.themeVariables?.mainBkgColor || "#0A1929";
  const textColor = mermaidConfig.themeVariables?.textColor || "#E8F4F8";
  const primaryColor = mermaidConfig.themeVariables?.primaryColor || "#2E86AB";
  
  // Calcula cor de sombra baseada na cor primária
  const shadowColor = primaryColor + "40"; // Adiciona transparência
  
  return `
<style>
.mermaidlens-diagram {
  background: ${bgColor};
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 4px 16px ${shadowColor};
  border: 1px solid ${primaryColor}33;
}
.mermaidlens-diagram .mermaid {
  color: ${textColor};
  background: transparent;
}
/* Garante contraste para textos dentro dos diagramas */
.mermaidlens-diagram svg text {
  fill: ${textColor} !important;
}
.mermaidlens-diagram svg .label text {
  fill: ${textColor} !important;
}
/* Melhora legibilidade de elementos específicos */
.mermaidlens-diagram svg .nodeLabel,
.mermaidlens-diagram svg .edgeLabel,
.mermaidlens-diagram svg .cluster-label {
  color: ${textColor} !important;
}
.mermaidlens-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${primaryColor};
  margin-bottom: 8px;
  opacity: 0.9;
}
.mermaidlens-error {
  margin: 0;
  padding: 12px 16px;
  font-size: 0.875rem;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.mermaidlens-empty .mermaidlens-error {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}
.mermaidlens-hover-mode .mermaidlens-label { display: none; }
.mermaidlens-hover-mode .mermaidlens-placeholder {
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
.mermaidlens-hover-mode .mermaidlens-placeholder:hover { opacity: 0.9; }
.mermaidlens-hover-mode .mermaidlens-render {
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
.mermaidlens-hover-mode .mermaidlens-wrap { position: relative; }
.mermaidlens-hover-mode .mermaidlens-wrap:hover .mermaidlens-render { display: block; }
</style>
<div data-mermaidlens-config="${escapedConfig}" style="display: none;"></div>
`;
}
