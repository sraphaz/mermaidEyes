/**
 * Resolve cores por semântica a partir de themeVariables.
 * Mantém interoperabilidade quando o arquivo de tema mudar:
 * cada semântica tenta várias chaves possíveis (em ordem) e usa a primeira encontrada.
 */
export type ThemeColorSemantic = "background" | "text" | "primary" | "border";

/** Chaves possíveis por semântica (ordem de preferência). Novos temas podem usar outras chaves. */
const SEMANTIC_KEYS: Record<ThemeColorSemantic, string[]> = {
  background: ["background", "mainBkgColor", "secondBkgColor", "noteBkgColor"],
  text: ["textColor", "primaryTextColor", "titleColor", "noteTextColor"],
  primary: ["primaryColor", "lineColor", "primaryBorderColor", "actorLineColor"],
  border: ["primaryBorderColor", "border1", "border2", "lineColor", "actorBorder"],
};

const DEFAULTS: Record<ThemeColorSemantic, string> = {
  background: "#0d1f18",
  text: "#e8f4f0",
  primary: "#1a5c4a",
  border: "#2a7a5f",
};

/** Só aceita valor que pareça hex (#RGB ou #RRGGBB) para não quebrar CSS. */
function isValidHex(s: string): boolean {
  return /^#[0-9A-Fa-f]{3}$/.test(s) || /^#[0-9A-Fa-f]{6}$/.test(s);
}

export interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  border: string;
}

/**
 * Obtém cores semânticas a partir de themeVariables.
 * Funciona com qualquer tema cujo theme.json exponha variáveis em mermaid.themeVariables;
 * se as chaves mudarem, basta atualizar SEMANTIC_KEYS neste arquivo.
 */
export function getThemeColors(vars: Record<string, string> | undefined): ThemeColors {
  const result: ThemeColors = {
    background: DEFAULTS.background,
    text: DEFAULTS.text,
    primary: DEFAULTS.primary,
    border: DEFAULTS.border,
  };
  if (!vars || typeof vars !== "object") return result;

  for (const semantic of Object.keys(SEMANTIC_KEYS) as ThemeColorSemantic[]) {
    for (const key of SEMANTIC_KEYS[semantic]) {
      const value = vars[key];
      if (typeof value === "string" && value.trim() && isValidHex(value.trim())) {
        result[semantic] = value.trim();
        break;
      }
    }
  }
  return result;
}
