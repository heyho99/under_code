from flask import Flask, jsonify, render_template, request

from .executor import CodeExecutor
from .grader import Grader
from .quiz_creator import QuizCreator


app = Flask(
    __name__,
    template_folder=".",
    static_folder="js",
    static_url_path="/js",
)


@app.route("/")
def index():
    quiz_data = QuizCreator().get_quiz(1)
    if not quiz_data:
        return "Quiz not found", 404
    return render_template("index.html", quiz=quiz_data)


@app.route("/run", methods=["POST"])
def run_code():
    data = request.get_json() or {}
    source_code = data.get("code")
    language = data.get("language", "python3")
    quiz_id = 1

    quiz_creator = QuizCreator()
    quiz_data = quiz_creator.get_quiz(quiz_id)
    if not quiz_data:
        return jsonify({"error": "quiz not found"}), 404

    test_cases = quiz_data.get("test_cases", [])

    results = []
    all_passed = True

    for input_val, expected_val in test_cases:
        executor = CodeExecutor(source_code, language, input_val)
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
                "input": input_val,
                "expected": expected_val,
                "output": output,
                "passed": passed,
            }
        )

    return jsonify({"all_passed": all_passed, "details": results})


if __name__ == "__main__":
    app.run(debug=True)

