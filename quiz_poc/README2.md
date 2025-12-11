flask --app quiz_poc run --debug


## フロー概要（新仕様）

1. クイズ作成フロー（オフライン前処理・構造化 Markdown ベース）
2. クイズプレイ画面表示フロー
3. クイズ実行フロー
4. クイズ判定フロー（採点）

## 前提知識
- バックエンドにPythonを使う
- **ハードコードの制約** と **jsonの制約**  を認識する
- Pythonが **\*.py 内のリテラル** を処理し、json文字列やrepr文字列を作成する
- 文字列リテラルを、*.py内のソースコードに、人間が見えるように書こうとすると、クオートが必要になる
- ハードコードしなければクオートは必要無い
- jsonは値として3種類のリテラルを規定している
   - 文字列：`"..."`
   - 配列：`[...]`
   - 連想配列：`{...}`


## クイズ作成フロー

1. **LLM による構造化 Markdown 生成**
   - LLMにマークダウンを出力してもらう

2. **マークダウンからjsonを生成**
   - マークダウンをfor文で1行ずつ読み、title, description, sysin_format, sample_code, testcasesを探す
   - それらを文字列としてpythonの変数に格納
   - python内で、値が格納された各変数を、dictでまとめる
   - そのdictを、json.dumpsでjson文字列に変換
      - pythonやその他言語で、jsonオブジェクトは文字列オブジェクトとして扱われる
      - json.dumpsは、dictの値が文字列の場合、勝手にエスケープしてくれる
      - 文字列リテラル以外をdictに含んだままjson.dumpsすると、jsonオブジェクトに勝手に変換されてしまう

3. **jsonを、generator→bff→quiz-service→DB と渡して保存する**


## クイズプレイ画面表示フロー

1. **frontendでクイズの表示をリクエスト**

2. **Quiz-service→BFF→Frontend**
   - jsonをBFFまで送信する
   - BFFからFrontendもそのままのjsonを送信する

3. **jsonの値をFrontendでパースして表示**
   - json内部の各値はエスケープされた文字列なので、それをjavascriptでDOMに埋め込めばよい
   - `response`をそのまま受け取ると、文字列リテラルとして受け取ることになるので、それをDOMに埋め込むと、エスケープ文字も表示される
   - `response.json`で受け取ると、javascriptオブジェクトとしてパースされるので、エスケープ文字は無い状態で各値を受け取れ、DOMに埋め込んでもエスケープ文字は出ない


## クイズ実行フロー

1. **アプリ起動**
   - `flask --app quiz_poc run --debug` で Flask アプリを起動する。
   - 起動時に `QuizRepository` が `backend/data/quizzes.json` を読み込み、クイズ一覧をメモリに載せる。

2. **クイズ一覧表示**
   - ブラウザで `/` にアクセスすると `backend/__init__.py` の `index()` が呼ばれ、
   - `QuizRepository.get_all_quizzes()` の結果を `frontend/quiz_list.html` でレンダリングする。

3. **個別クイズ画面表示**
   - `/quiz/<id>` にアクセスすると `show_quiz()` が呼ばれ、
   - 指定 ID のクイズを取得して `description`（Markdown 文字列）を `markdown.markdown()` で HTML に変換し、
   - `frontend/index.html` を使って問題画面を表示する。


## クイズ判定フロー（/execute・/run）

1. **「実行」ボタン（/execute）**
   - 画面上のエディタのコードを `backend/executor.py` の `CodeExecutor` に渡し、
   - paiza.io API を通じてコードを実行する。
   - テストケースや `sysin` は使わず、標準入力は常に空文字列として実行する。

2. **「提出」ボタン（/run）**
   - `QuizRepository` から対象クイズの `test_cases` を取得する。
   - 各テストケースについて:
     - `build_source_with_sysin()` で `sysin = <テスト入力>` をコード先頭に埋め込んだソースを生成し、
     - `CodeExecutor.run()` で外部実行して標準出力を取得する。
     - `backend/grader.py` の `Grader.judge(stdout, expected)` で期待値と比較して正誤判定する。
       - 期待値が非文字列の場合は、ユーザ出力を `ast.literal_eval()` で Python オブジェクトに変換してから比較する。
   - すべてのテストに通れば AC、それ以外は WA として結果を JSON で返す。


## ディレクトリツリー

quiz_poc/
├─ backend/                     # POC の「サービス側」(将来 generator/quiz/executor に分離)
│  ├─ __init__.py               # Flask アプリ本体 (API 兼 デモ用 HTML 出力)
│  ├─ executor.py               # paiza.io API を叩いてコードを実行するラッパ
│  ├─ grader.py                 # ユーザ出力と期待値を比較して採点するロジック
│  ├─ quiz_repository.py        # quizzes.json を読み込んでクイズオブジェクトを提供
│  ├─ extract_quizzes.py        # quizzes_2.md から quizzes.json を生成するスクリプト
│  ├─ llm_creator.py            # LLM を使って quizzes_2.md を生成するユーティリティ
│  ├─ data/
│  │  ├─ quizzes.json           # 疑似 DB（本番では quiz-db のテーブル想定）
│  │  ├─ quizzes_2.md           # LLM 出力ログ（構造化 Markdown: #n問目 / ##title ... 形式）
│  │  └─ test_py_code.txt       # 対象コード（本番ではBFFが受け取るアップロードファイルに相当）
│  └─ .env                      # API キー等 (必要に応じて)
│
├─ frontend/                    # POC の「画面側」(将来 frontend/ に統合)
│  ├─ index.html                # 問題画面
│  ├─ quiz_list.html            # 一覧画面
│  └─ js/
│     ├─ editor.js
│     └─ run_code.js
│
└─ README2.md                   # 新仕様フロー（構造化 Markdown 版）の説明