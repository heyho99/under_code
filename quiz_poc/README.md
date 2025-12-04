flask --app quiz_poc run --debug


原因は set の「順番違い」を文字列として比較しているから です。

今の採点ロジックは 
Grader.judge
 でこうしています:

user_output（あなたの print(names) の標準出力）を文字列化して strip()
expected_output（テストケースの expected、ここでは {"item_id", "user_id"} など）も str() して strip()
その 2 つの文字列を 完全一致で比較 しています。
何が起きているか
ケース1を例にすると:

あなたのコード:
python
names = set(re.findall(r"{(.*?)}", path))
print(names)
→ 出力: {'item_id', 'user_id'}
テストケース側の expected:
python
{"user_id", "item_id"}
→ Python 内部での str(expected) が "{'user_id', 'item_id'}" になっている
set 自体の中身は同じでも、

期待値: "{'user_id', 'item_id'}"
あなたの出力: "{'item_id', 'user_id'}"
という 「文字列としての違い」 があるので、
Grader.judge
 が False を返して WA になります。

ケース3も同じ理由です。

期待値: {'two', 'one'}
出力: {'one', 'two'}
中身は同じ集合だけど、文字列表現の順番が違うので不一致になります。

どうするのが良いか
設計としては、set を文字列で比較しない 方が自然なので、どちらかの方向に寄せる必要があります:

Grader 側で set を特別扱いする
expected_output が set のときは:
user_output を ast.literal_eval() などで Python オブジェクトに変換して
set(パース結果) == expected_output で比較する
こうすると順番に依存しなくなります。
クイズ側の仕様を「順序付き」に変える
クイズの expected を set ではなく、例えばソート済みリストにする:
python
"expected": ["item_id", "user_id"]
あなたのコードも print(sorted(names)) のように出力をリストに揃える。
ただしこの場合は 
quizzes.md
 / 
extract_quizzes.py
 / 
quizzes.json
 側のデータ定義を変更する必要があります。
この POC だと、1 をやって Grader を少し賢くするのが一番筋が良さそうです。

いまの状態の答え
なぜ WA なのか

集合の中身は正しい が、
set の文字列表現の「順番違い」が原因で、Grader が不一致と判定している
というのが理由です。



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