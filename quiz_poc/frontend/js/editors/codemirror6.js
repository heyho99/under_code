import { EditorView, basicSetup } from "codemirror/codemirror/dist/index.js";
import { python } from "codemirror/lang-python/dist/index.js";
import { oneDark } from "codemirror/theme-one-dark/dist/index.js";

const initialValue = [
  "# ここにコードを書いて実行ボタンで試してください",
  "# 提出時、システムが各テストケースごとに sysin に値を代入します。",
  "# sysinの受け取り方例：a, b = sysin",
  "",
  "",
].join("\n");

const container = document.getElementById("editor");
if (!container) {
  console.error("editor element not found");
} else {
  const view = new EditorView({
    doc: initialValue,
    extensions: [basicSetup, python(), oneDark],
    parent: container,
  });

  window.editorAdapter = {
    getValue: function () {
      return view.state.doc.toString();
    },
    setValue: function (code) {
      if (typeof code !== "string") return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
      });
    },
    focus: function () {
      view.focus();
    },
  };
}
