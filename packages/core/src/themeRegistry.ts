import fs from "fs";
import path from "path";

export interface MermaidTheme {
  id: string;
  name: string;
  author?: string;
  version?: string;
  mermaid: {
    theme: string;
    themeVariables: Record<string, string>;
  };
}

let themes: MermaidTheme[] = [];

export const defaultThemeId = "ocean";

export function loadThemes(basePath: string): MermaidTheme[] {
  const themeRoot = path.resolve(basePath);
  if (!fs.existsSync(themeRoot)) {
    themes = [];
    return themes;
  }

  try {
    const entries = fs.readdirSync(themeRoot, { withFileTypes: true });
    themes = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(themeRoot, entry.name, "theme.json"))
      .filter((themePath) => fs.existsSync(themePath))
      .map((themePath) => {
        try {
          let raw = fs.readFileSync(themePath, "utf-8");
          if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
          const theme = JSON.parse(raw) as MermaidTheme;
          // Validação básica
          if (!theme.id || !theme.mermaid) {
            console.warn(`[MermaidLens] Theme em ${themePath} está inválido: falta 'id' ou 'mermaid'`);
            return null;
          }
          return theme;
        } catch (error) {
          console.error(`[MermaidLens] Erro ao carregar tema de ${themePath}:`, error);
          return null;
        }
      })
      .filter((theme): theme is MermaidTheme => theme !== null);

    return themes;
  } catch (error) {
    console.error(`[MermaidLens] Erro ao ler diretório de temas ${themeRoot}:`, error);
    themes = [];
    return themes;
  }
}

export function getThemeById(id: string): MermaidTheme | undefined {
  return themes.find((theme) => theme.id === id);
}

export function getDefaultTheme(): MermaidTheme | undefined {
  return getThemeById(defaultThemeId) ?? themes[0];
}
