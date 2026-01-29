/**
 * Garante que activate() não abre documentos nem cria abas (evita Untitled ao iniciar).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const showTextDocument = vi.fn();
const openTextDocument = vi.fn();

vi.mock("vscode", () => ({
  window: { showTextDocument },
  workspace: {
    openTextDocument,
    getConfiguration: vi.fn().mockReturnValue({ get: vi.fn() }),
    onDidChangeConfiguration: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  },
  Uri: { file: (p: string) => ({ scheme: "file", fsPath: p }) },
  ViewColumn: { One: 1 },
  Position: vi.fn(),
  Range: vi.fn(),
  Selection: vi.fn(),
  TextEditorRevealType: { AtTop: 0 },
  commands: {
    registerCommand: vi.fn((_id: string, fn: () => unknown) => ({ dispose: vi.fn(), _fn: fn })),
    executeCommand: vi.fn(),
  },
  languages: { registerHoverProvider: vi.fn().mockReturnValue({ dispose: vi.fn() }) },
  extensions: { getExtension: vi.fn() },
}));

vi.mock("@mermaidlens/core", () => ({
  loadThemes: vi.fn().mockReturnValue([{ id: "ocean", mermaid: { themeVariables: {} } }]),
  loadPresets: vi.fn().mockReturnValue([]),
  getThemeById: vi.fn(),
  getDefaultTheme: vi.fn().mockReturnValue({ mermaid: { themeVariables: {} } }),
  getPresetById: vi.fn(),
  getThemeColors: vi.fn(),
  applyPreset: vi.fn((x: string) => x),
  scanMermaid: vi.fn(),
}));

vi.mock("../features/welcome", () => ({ showWelcomePage: vi.fn() }));
vi.mock("../mermaidHover", () => ({ registerMermaidHover: vi.fn().mockReturnValue({ dispose: vi.fn() }) }));
vi.mock("../markdownPlugin", () => ({ markdownPlugin: vi.fn() }));

describe("activate", () => {
  beforeEach(() => {
    showTextDocument.mockClear();
    openTextDocument.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("never calls openTextDocument or showTextDocument during activation", async () => {
    const { activate } = await import("../extension");
    const context = {
      extensionPath: "/fake/extension",
      subscriptions: { push: vi.fn() },
      globalState: { get: vi.fn(), update: vi.fn() },
    };

    activate(context as never);

    expect(openTextDocument).not.toHaveBeenCalled();
    expect(showTextDocument).not.toHaveBeenCalled();
  });
});
