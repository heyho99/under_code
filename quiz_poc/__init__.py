from flask import Flask, jsonify, render_template, request
import markdown

from .executor import CodeExecutor
from .grader import Grader
from .quiz_repository import QuizRepository


def build_source_with_sysin(user_source, sysin_value):
    sysin_literal = repr(sysin_value)
    return f"sysin = {sysin_literal}\n\n" + (user_source or "")


app = Flask(
    __name__,
    template_folder=".",
    static_folder="js",
    static_url_path="/js",
)


@app.route("/")
def index():
    quiz_repo = QuizRepository()
    quizzes = quiz_repo.get_all_quizzes()
    return render_template("quiz_list.html", quizzes=quizzes)


@app.route("/quiz/<int:quiz_id>")
def show_quiz(quiz_id):
    quiz_data = QuizRepository().get_quiz(quiz_id)
    if not quiz_data:
        return "Quiz not found", 404

    description_md = quiz_data.get("description") or ""
    description_html = markdown.markdown(description_md)
    quiz_with_html = dict(quiz_data)
    quiz_with_html["description_html"] = description_html

    return render_template("index.html", quiz=quiz_with_html)


@app.route("/execute", methods=["POST"])
def execute_code():
    """実行ボタン用エンドポイント。

    - テストケースは使用せず、input も常に空文字として実行する。
    - 提出時 (/run) 側でのみ、テストケースの入力が input として渡される。
    """

    data = request.get_json() or {}
    source_code = data.get("code")
    language = data.get("language", "python3")

    # 実行のみの場合は標準入力を与えない（空文字）。
    input_val = ""

    executor = CodeExecutor(source_code, language, input_val)
    exec_result = executor.run()

    if exec_result.get("result") != "success":
        stdout = ""
        stderr = (
            exec_result.get("stderr")
            or exec_result.get("error")
            or "Error"
        )
        error = exec_result.get("error") or "execution failed"
    else:
        stdout = exec_result.get("stdout") or ""
        stderr = exec_result.get("stderr") or ""
        error = None

    return jsonify(
        {
            "stdout": stdout,
            "stderr": stderr,
            "result": exec_result.get("result"),
            "error": error,
        }
    )


@app.route("/run", methods=["POST"])
def run_code():
    """提出ボタン用エンドポイント。

    各テストケースの Python オブジェクトを sysin 変数としてユーザコードに渡し、その出力で正誤判定する。
    ユーザは提出時、sysin を使ったコードを書くことを前提とする。
    """

    data = request.get_json() or {}
    source_code = data.get("code")
    language = data.get("language", "python3")
    quiz_id = data.get("quiz_id", 1)

    quiz_repo = QuizRepository()
    quiz_data = quiz_repo.get_quiz(quiz_id)
    if not quiz_data:
        return jsonify({"error": "quiz not found"}), 404

    test_cases = quiz_data.get("test_cases", [])

    results = []
    all_passed = True

    for case in test_cases:
        sysin_value = case.get("sysin")
        expected_val = case.get("expected")

        wrapped_source = build_source_with_sysin(source_code, sysin_value)

        # sysin でデータを渡すため、標準入力用の input 文字列は空のまま実行する。
        executor = CodeExecutor(wrapped_source, language, "")
        exec_result = executor.run()

        if exec_result.get("result") != "success":
            passed = False
            output = (
                exec_result.get("stderr")
                or exec_result.get("error")
                or "Error"
            )
        else:
            output = exec_result.get("stdout")
            passed = Grader.judge(output, expected_val)

        if not passed:
            all_passed = False

        results.append(
            {
                "sysin": repr(sysin_value),
                "expected": expected_val,
                "output": output,
                "passed": passed,
            }
        )

    return jsonify({"all_passed": all_passed, "details": results})


if __name__ == "__main__":
    app.run(debug=True)

