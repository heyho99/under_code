import * as monaco from "monaco-editor";

/**
 * Create a Monaco editor instance.
 *
 * @param {HTMLElement} container - DOM element to mount the editor into.
 * @param {{ initialCode?: string }} options
 * @returns {{ getValue(): string, setValue(code: string): void, focus(): void, dispose(): void }}
 */
const MONACO_LANGUAGE_MAP = {
  python3: "python",
  javascript: "javascript",
  go: "go",
};

export function createMonacoEditor(container, { initialCode = "", language = "python3" } = {}) {
  if (!container) {
    throw new Error("Editor container is required for Monaco editor");
  }

  const monacoLanguage = MONACO_LANGUAGE_MAP[language] || "python";

  const editor = monaco.editor.create(container, {
    value: initialCode,
    language: monacoLanguage,
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
