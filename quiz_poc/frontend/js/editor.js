var editor;

(function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/python");

    editor.setValue(
        [
            "# ここにコードを書いて実行ボタンで試してください",
            "# 提出時、システムが各テストケースごとに sysin に値を代入します。",
            "# sysinの受け取り方例：a, b = sysin",
            "",
            
        ].join("\n")
    );
})();
