import { createMonacoEditor } from "./MonacoCodeEditor.js";
import { createCodemirror6Editor } from "./Codemirror6CodeEditor.js";

const DEFAULT_EDITOR_TYPE = "cm6"; // "monaco" で切り替え可能

/**
 * Create an editor instance with a unified interface.
 *
 * @param {{ container: HTMLElement, initialCode?: string, language?: string, type?: "monaco" | "cm6" }} params
 * @returns {{ getValue(): string, setValue(code: string): void, focus(): void, dispose?: () => void }}
 */
export function createEditor({ container, initialCode = "", language = "python3", type = DEFAULT_EDITOR_TYPE } = {}) {
  if (!container) {
    throw new Error("Editor container is required");
  }

  if (type === "monaco") {
    return createMonacoEditor(container, { initialCode, language });
  }

  if (type === "cm6") {
    return createCodemirror6Editor(container, { initialCode, language });
  }

  throw new Error(`Unsupported editor type: ${type}`);
}
