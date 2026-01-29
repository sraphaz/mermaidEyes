import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { openTextDocument, showTextDocument, showErrorMessage, showInformationMessage, executeCommand } = vi.hoisted(() => ({
  openTextDocument: vi.fn(),
  showTextDocument: vi.fn(),
  showErrorMessage: vi.fn(),
  showInformationMessage: vi.fn().mockResolvedValue(undefined),
  executeCommand: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("vscode", () => ({
  workspace: {
    openTextDocument,
  },
  window: {
    showTextDocument,
    showErrorMessage,
    showInformationMessage,
  },
  commands: {
    executeCommand,
  },
  Uri: {
    file: (value: string) => ({ fsPath: value }),
  },
  ViewColumn: {
    One: 1,
  },
}));

vi.mock("fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
}));

import { showWelcomePage } from "../features/welcome";

describe("showWelcomePage", () => {
  beforeEach(() => {
    openTextDocument.mockReset();
    showTextDocument.mockReset();
  });

  it("does nothing when welcome was already shown", async () => {
    const context = {
      extensionPath: "/extensions/mermaideyes",
      globalState: {
        get: vi.fn().mockReturnValue(true),
        update: vi.fn()
      }
    } as const;

    await showWelcomePage(context);

    expect(openTextDocument).not.toHaveBeenCalled();
    expect(showTextDocument).not.toHaveBeenCalled();
    expect(context.globalState.update).not.toHaveBeenCalled();
  });

  it("opens welcome document and updates global state", async () => {
    const context = {
      extensionPath: "/extensions/mermaideyes",
      globalState: {
        get: vi.fn().mockReturnValue(false),
        update: vi.fn()
      }
    } as const;

    const expectedPath = path.resolve(context.extensionPath, "media", "welcome.md");
    openTextDocument.mockResolvedValue({ uri: { fsPath: expectedPath } });

    await showWelcomePage(context);

    expect(openTextDocument).toHaveBeenCalledWith(expect.objectContaining({ fsPath: expectedPath }));
    expect(showTextDocument).toHaveBeenCalledWith(
      expect.objectContaining({ uri: expect.objectContaining({ fsPath: expectedPath }) }),
      expect.objectContaining({ preview: false, viewColumn: 1 })
    );
    expect(context.globalState.update).toHaveBeenCalledWith("mermaideyes.hasShownWelcome", true);
  });
});
