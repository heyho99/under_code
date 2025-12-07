var editor;

(function () {
  if (typeof require === "undefined") {
    console.error("Monaco loader is not loaded. Include monaco loader CDN before editors/monaco.js.");
    return;
  }

  // CDN 上の Monaco Editor のパス設定
  require.config({
    paths: {
      vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs",
    },
  });

  require(["vs/editor/editor.main"], function () {
    var initialValue = [
      "# ここにコードを書いて実行ボタンで試してください",
      "# 提出時、システムが各テストケースごとに sysin に値を代入します。",
      "# sysinの受け取り方例：a, b = sysin",
      "",
      "",
    ].join("\n");

    var container = document.getElementById("editor");
    if (!container) {
      console.error("editor element not found");
      return;
    }

    editor = monaco.editor.create(container, {
      value: initialValue,
      language: "python",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
    });

    window.editorAdapter = {
      getValue: function () {
        return editor.getValue();
      },
      setValue: function (code) {
        if (typeof code === "string") {
          editor.setValue(code);
        }
      },
      focus: function () {
        editor.focus();
      },
    };
  });
})();
