flask --app quiz_poc run --debug


quiz_poc/
  backend/                 # POC の「サービス側」 (将来 generator/quiz/executor に分離)
    __init__.py           # 今の Flask アプリ (API 兼 デモ用 HTML 出力)
    executor.py
    grader.py
    quiz_repository.py
    extract_quizzes.py
    llm_creator.py        # ← ここに prompt_test.md をハードコード
    data/
      quizzes.json        # 疑似 DB（本番では quiz-db のテーブル）
      quizzes.md          # LLM 出力ログ（本番では基本は使わない）
      test_py_code.txt    # 対象コード（本番では quiz_source_data テーブルなど）
    .env                  # API キー等 (必要に応じて)

  frontend/               # POC の「画面側」 (将来 frontend/ に統合)
    index.html            # 問題画面 (今の index.html)
    quiz_list.html        # 一覧画面
    js/
      editor.js
      run_code.js

  README.md               # POC の起動方法など