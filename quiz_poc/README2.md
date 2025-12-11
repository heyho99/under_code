flask --app quiz_poc run --debug

Python: ast.literal_evalでOK
JS/TS: vmでOK
Go: jsonかませないと厳しいか
→jsonの型にしぼるか、Goだけjsonかませるか。。

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
   - オブジェクト：`{...}`
   - bool：`true/false`
   - `null`
- コードやテストケースを含めた各値は、文字列にし、jsonにも文字列として入れて輸送することで、ダンプするだけで解凍が可能
- `ast.literal_eval`は文字列をPythonとしてパースできる（コードは読み取れない）
- コードの実行は`paizaio api`に任せるので、`exec`は必要ない


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
   - json内部の各値はエスケープされた文字列
   - `response`をそのまま受け取ると、文字列リテラルとして受け取ることになるので、それをDOMに埋め込むと、エスケープ文字も表示される
   - `response.json`で受け取ると、javascriptオブジェクトとしてパースされるので、エスケープ文字は無い状態で各値を受け取れ、DOMに埋め込んでもエスケープ文字は出ない（json制約から解放される）


## クイズ実行フロー

1. **エディタにユーザがコードを入力する**

2. **実行ボタンを押す**
    - 実行ボタンが押されると、入力されたコードが文字列としてjavascriptの変数に格納される
    - その文字列をjsonにダンプする（エスケープしてjson文字列の値に入れる）
    - frontend→bff→excutorとjsonを送信
3. **generatorでパース**
    - generatorでjsonをパースし、dictに変換（エスケープが解除される）（値はコードの文字列）
    - `paizaio api`でコードが実行され、出力を取得する
4. **出力をjsonにダンプし、frontendまで返送する**


## クイズ判定フロー

1. **エディタにユーザがコードを入力する**

2. **提出ボタンを押す**
    - 提出ボタンが押されると、入力されたコードが文字列としてjavascriptの変数に格納される
    - その文字列をjsonにダンプする（エスケープしてjson文字列の値に入れる）
    - frontend→bff→validatorとjsonを送信
3. **validatorでtestcasesを取得**
    - bffがquiz-serviceにproblemを要求
    - quiz-service→bff→validatorとjsonを送信
    - validatorはjsonからtestcase["expected"]3つを`ast.literal_eval`し、Pythonオブジェクトとして保持する（testcase["sysin"]は文字列のままで良い）
4. **validatorで、ユーザが入力したコードに、testcaseを入れ実行する**
    - validatorでユーザ入力コードのjsonをパースし、dictに変換（エスケープが解除される）（値はコードの文字列）
    - sysin変数に1つ目のtestcase["sysin"]を入れる
    - `paizaio api`でユーザ入力コードが実行される（ユーザ入力コードにsysinがあれば、sysinに接続できる）
5. **判定**
    - 実行された値を取得し、`ast.literal_eval`でPythonオブジェクトとして保持
    - その実行結果と1つ目のtestcase["expected"]を==で比較
    - 比較結果がTrueなら良い、Falseならダメ
6. **結果を返す**
    - 判定を3回行い結果をまとめる
    - 全部Trueなら合格、１つでもFalseなら不合格
    - 3回分の結果と、合否結果をfrontendに返す



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