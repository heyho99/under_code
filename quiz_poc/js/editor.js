var editor;

(function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/python");

    editor.setValue("import sys\n\n# 入力を受け取る\nline = sys.stdin.readline()\na, b = map(int, line.split())\nprint(a + b)");
})();
