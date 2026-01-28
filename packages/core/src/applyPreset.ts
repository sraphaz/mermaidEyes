import type { MermaidPreset } from "./presetRegistry";

/** Diagram type keywords Mermaid detects; first line must match one of these (or follow %%{init}%%). */
const DIAGRAM_FIRST_LINE = /^\s*(%%\{|graph\s|flowchart\s|sequenceDiagram|gantt|pie\s|journey\s|stateDiagram|classDiagram|erDiagram|block-beta|mindmap\s|timeline\s|quadrantChart|xyChart|requirementDiagram)/i;

export function applyPreset(code: string, preset?: MermaidPreset): string {
  const trimmed = code.trim();
  if (!trimmed) {
    return code;
  }
  if (!preset?.directives || Object.keys(preset.directives).length === 0) {
    return trimmed;
  }

  const initBlock = `%%{init: ${JSON.stringify(preset.directives)}}%%`;
  const withInit = `${initBlock}\n${trimmed}`;
  return withInit;
}

export function isLikelyValidMermaid(code: string): boolean {
  const t = code.trim();
  if (!t) return false;
  return DIAGRAM_FIRST_LINE.test(t) || t.startsWith("%%{");
}
