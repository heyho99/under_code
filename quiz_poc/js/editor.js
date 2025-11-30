var editor;

(function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/python");

    editor.setValue(
        [
            "# ここにコードを書いて実行ボタンで試してください",
            "# 例: sysin に (3, 5) を入れて和を計算する",
            "sysin = (3, 5)",
            "a, b = sysin",
            "print(a + b)",
            "",
            "# 実行ボタンで試すときは、上の sysin の値を書き換えても構いません。",
            "# 提出ボタンでは、システムが各テストケースごとに sysin に値を代入します。",
            "# 提出用コードでは、自分で sysin を代入する行は削除またはコメントアウトしてください。",
        ].join("\n")
    );
})();
