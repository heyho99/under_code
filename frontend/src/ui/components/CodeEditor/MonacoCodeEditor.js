import * as monaco from "monaco-editor";

/**
 * Create a Monaco editor instance.
 *
 * @param {HTMLElement} container - DOM element to mount the editor into.
 * @param {{ initialCode?: string }} options
 * @returns {{ getValue(): string, setValue(code: string): void, focus(): void, dispose(): void }}
 */
export function createMonacoEditor(container, { initialCode = "" } = {}) {
  if (!container) {
    throw new Error("Editor container is required for Monaco editor");
  }

  const editor = monaco.editor.create(container, {
    value: initialCode,
    language: "python",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: false },
  });

  return {
    getValue() {
      return editor.getValue();
    },
    setValue(code) {
      if (typeof code !== "string") return;
      editor.setValue(code);
    },
    focus() {
      editor.focus();
    },
    dispose() {
      editor.dispose();
    },
  };
}
