var editor;

(function () {
  if (typeof ace === "undefined") {
    console.error("Ace Editor is not loaded. Make sure the CDN script is included before editors/ace.js.");
    return;
  }

  editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/python");

  editor.setValue(
    [
      "# ここにコードを書いて実行ボタンで試してください",
      "# 提出時、システムが各テストケースごとに sysin に値を代入します。",
      "# sysinの受け取り方例：a, b = sysin",
      "",
      "",
    ].join("\n"),
    -1 // move cursor to start
  );

  window.editorAdapter = {
    getValue: function () {
      return editor.getValue();
    },
    setValue: function (code) {
      editor.setValue(code, -1);
    },
    focus: function () {
      editor.focus();
    },
  };
})();
