import fs from "fs";
import path from "path";

export interface MermaidPreset {
  id: string;
  label: string;
  directives: Record<string, unknown>;
}

let presets: MermaidPreset[] = [];

export function loadPresets(basePath: string): MermaidPreset[] {
  const presetRoot = path.resolve(basePath);
  if (!fs.existsSync(presetRoot)) {
    presets = [];
    return presets;
  }

  try {
    const entries = fs.readdirSync(presetRoot, { withFileTypes: true });
    presets = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(presetRoot, entry.name, "preset.json"))
      .filter((presetPath) => fs.existsSync(presetPath))
      .map((presetPath) => {
        try {
          const raw = fs.readFileSync(presetPath, "utf-8");
          const preset = JSON.parse(raw) as MermaidPreset;
          // Validação básica
          if (!preset.id || !preset.directives) {
            console.warn(`[MermaidLens] Preset em ${presetPath} está inválido: falta 'id' ou 'directives'`);
            return null;
          }
          return preset;
        } catch (error) {
          console.error(`[MermaidLens] Erro ao carregar preset de ${presetPath}:`, error);
          return null;
        }
      })
      .filter((preset): preset is MermaidPreset => preset !== null);

    return presets;
  } catch (error) {
    console.error(`[MermaidLens] Erro ao ler diretório de presets ${presetRoot}:`, error);
    presets = [];
    return presets;
  }
}

export function getPresetById(id: string): MermaidPreset | undefined {
  return presets.find((preset) => preset.id === id);
}
