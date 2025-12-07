import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

/**
 * Create a CodeMirror 6 editor instance.
 *
 * @param {HTMLElement} container - DOM element to mount the editor into.
 * @param {{ initialCode?: string }} options
 * @returns {{ getValue(): string, setValue(code: string): void, focus(): void }}
 */
export function createCodemirror6Editor(container, { initialCode = "" } = {}) {
  if (!container) {
    throw new Error("Editor container is required for CodeMirror 6");
  }

  const view = new EditorView({
    doc: initialCode,
    extensions: [basicSetup, python(), oneDark],
    parent: container,
  });

  return {
    getValue() {
      return view.state.doc.toString();
    },
    setValue(code) {
      if (typeof code !== "string") return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
      });
    },
    focus() {
      view.focus();
    },
  };
}
