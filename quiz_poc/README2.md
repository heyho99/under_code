flask --app quiz_poc run --debug


## 判定の実装について
1. **expectedとpaiza io apiの出力を各言語のオブジェクトに変換して等号で判定**
      - 言語のあらゆる型を扱えるので理想
      - 各言語へのオブジェクトの変換が困難な言語がある（一応できるっぽいが）
2. **expectedをjsonで表現可能なオブジェクトに限定し、expectedとpaiza io apiはjsonパースしてpythonオブジェクトに変換し、等号で判定**
      - jsonはあらゆる言語で標準ライブラリで扱える
      - jsonで限定されてしまうので、setやタプル等ができなくなり、とても狭い範囲での出題になってしまいそう
3. **expectedとpaiza io apiは文字列で保持し、文字列の比較で判定**
      - 文字列の比較なので集合やdictなどオブジェクト内の順序が決まっていないものについて判定が不可能

今回は2のjsonパースを採用する


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
- jsonは値として6種類のデータ型を規定している
   - 文字列：`"..."`
   - 配列：`[...]`
   - オブジェクト：`{...}`
   - 数値：`0`
   - bool：`true/false`
   - `null`
- JSON自体に camelCase/snake_case の規約は無い（プロジェクトの命名規約の問題）
- このプロジェクトでは **API(JSON)は camelCase、DBカラムは snake_case** を想定する
- コードは文字列としてJSONに載せて輸送する（JSONの制約に合わせてエスケープされる）
- sysin/expected/testcases は JSON 値（object/array/number/...）として扱う（JSONBで保持する想定）
- コードの実行は executor-service に任せる


## クイズ作成フロー

1. **LLM による構造化 Markdown 生成**
   - LLMにマークダウンを出力してもらう
    ~~~markdown: markdown例（Python）
    # 1問目

    ## title
    辞書内包表記による値の加工

    ## description
    辞書内包表記を使用して、元の辞書の「値 (value)」をすべて文字列型に変換した新しい辞書を作成し、それを標準出力してください。

    ## sysinFormat
    `{key: value, ...}`

    ## sampleCode
    ```python:1
    result = {k: str(v) for k, v in sysin.items()}
    print(result)
    ```

    ## testcases
    ### testcase1
    `{"sysin": {"a": 1, "b": 2}, "expected": {'a': '1', 'b': '2'}}`
    ### testcase2
    `{"sysin": {"x": 10.5, "y": True}, "expected": {'x': '10.5', 'y': 'True'}}`
    ### testcase3
    `{"sysin": {}, "expected": "{}"}`

    ...

    # n問目
    ...

    ~~~

2. **マークダウンからjsonを生成**
   - マークダウンをfor文で1行ずつ読み、`title` / `description` / `sysin_format` / `sample_code` / `test_cases` を探す
   - python内で、値が格納された各変数を、dictでまとめる
   - そのdictを、json.dumpsでjson文字列に変換
      - pythonやその他言語で、jsonオブジェクトは文字列オブジェクトとして扱われる
      - json.dumpsは、dictの値が文字列の場合、勝手にエスケープする（json制約対応のため）
      - （文字列リテラル以外をdictに含んだままjson.dumpsすると、jsonオブジェクトに勝手に変換される）

   **変換後JSON例（上のmarkdown例の1問目）**
   ```json
   {
     "title": "辞書内包表記による値の加工",
     "description": "辞書内包表記を使用して、元の辞書の「値 (value)」をすべて文字列型に変換した新しい辞書を作成し、それを標準出力してください。",
     "sysinFormat": "{key: value, ...}",
     "sampleAnswer": "result = {k: str(v) for k, v in sysin.items()}\nprint(result)\n",
     "testcases": [
       { "sysin": { "a": 1, "b": 2 }, "expected": { "a": "1", "b": "2" } },
       { "sysin": { "x": 10.5, "y": true }, "expected": { "x": "10.5", "y": "True" } },
       { "sysin": {}, "expected": "{}" }
     ]
   }
   ```

3. **jsonを、generator→bff→quiz-service→DB と渡して保存する**


## クイズプレイ画面表示フロー

1. **frontendでクイズの表示をリクエスト**

2. **Quiz-service→BFF→Frontendとjsonでproblemを送信**
    - problemsテーブルからクイズを取得
    - jsonに変換
    - Frontendまで送信

3. **starterCode（初期表示コード）を用意して、問題文とエディタを表示**
   - starterCode は言語別のエディタ初期表示テンプレ（stdinを読み JSON パースして sysin 変数を作るためのコード）
   - starterCode は問題ごとに変わらない想定のため、DBには保存せず BFF側で用意する
   - APIレスポンスの JSON を文字列として表示するとエスケープ文字が見えることがあるため、`response.json()` でパースした値をDOMに入れて表示する


## クイズ実行フロー

1. **エディタにユーザがコードを入力する**

2. **実行ボタンを押す**
    - 実行ボタンが押されると、入力されたコードが文字列としてjavascriptの変数に格納される
    - エディタのコードは starterCode（初期表示テンプレ）+ ユーザ追記 の全体を送る想定
    - その文字列をそのままjsonにダンプする（エスケープしてjson文字列の値(文字列として)に入れる）
    - frontend→bff→excutorとjsonを送信
3. **executorでパース**
    - executorでjsonをパースし、dictに変換（エスケープが解除される）（値はコードの文字列）
    - executor-service がコードを実行し、出力を取得する
4. **出力文字列をfrontendまで返送する**
    - 出力文字列をjsonに文字列の値としてダンプ
    - jsonをfrontendまでそのまま送信
    - frontendで`response.json`でjavascriptオブジェクトとして保持（値は文字列）
    - DOMに入れて表示


## クイズ判定フロー

### 初期表示コード（starterCode）
- 初期表示コード（starterCode）はエディタに最初から入っている言語別テンプレとして扱う
- ユーザは「stdin に渡される JSON を sysin にパース済みの状態で使える」前提で解答コードを書く
- 言語によって stdin の読み方や変数定義が異なるので、言語ごとにテンプレを用意する必要がある
- このテンプレは問題ごとに変わらない想定のため、DBには保存せず BFF か Frontend 側で用意してエディタの初期表示に使う
- sysin に渡される testcase（testcase["sysin"]）は、必ず JSON で表現可能な値が渡される
- sysin はコードに埋め込まず、paiza の stdin（input）として JSON 文字列を渡し、テンプレ側で JSON パースして sysin 変数を作る
- Go は単純な追記が難しいため、最初から `package main` を含むテンプレにしてユーザがその中に書く形になる

**APIで扱うjson例**
```json
{
  "problemId": 1002,
  "title": "a + b[1] を出力する",
  "description": "変数 sysin には {\"a\": number, \"b\": [number, number], \"s\": string} が入ります。a + b[1] を計算し、結果を JSON として1行で出力してください。",
  "sysinFormat": "{\"a\": number, \"b\": [number, number], \"s\": string}",
  "sampleAnswer": "import json\nanswer = sysin[\"a\"] + sysin[\"b\"][1]\nprint(json.dumps(answer))\n",
  "testcases": [
    {
      "sysin": { "a": 1, "b": [2, 3], "s": "hello" },
      "expected": 4
    },
    {
      "sysin": { "a": 10, "b": [0, 5], "s": "x" },
      "expected": 15
    }
  ]
}
```

**Python初期表示コード:**
```python
import sys, json
sysin = json.loads(sys.stdin.read())
```

**javascript(Node)初期表示コード:**
```javascript
const fs = require("fs");
const sysin = JSON.parse(fs.readFileSync(0, "utf8"));
```

**Go初期表示コード:**
```Go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

func main() {
	var sysin interface{}
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	fmt.Println(sysin) // ここから下をユーザが書く
}
```


### フロー

1. **エディタにユーザがコードを入力する**

2. **提出ボタンを押す**
    - 提出ボタンが押されると、入力されたコードが文字列としてjavascriptの変数に格納される
    - その文字列をjsonにダンプする（エスケープしてjson文字列の値に入れる）
    - frontend→bff→validatorとjsonを送信
3. **validatorでtestcasesを取得**
    - bffがquiz-serviceにproblemを要求
    - quiz-service→bff→validatorとjsonを送信

4. **validatorでtestcase["expected"]をパース**
    - `expected_value = testcase["expected"]` で `expected_value` として保持する（JSONB想定のため json.loads は不要）
5. **validatorで、ユーザ入力コードを実行する**
    - validatorでユーザ入力コード文字列を取得
    - `stdin = json.dumps(testcase["sysin"], ensure_ascii=False) + "\n"` を作る
    - executor-service に `{ language, code, stdin }` を渡して実行し、stdout/stderr/exitCode を取得する
6. **判定**
    - stdout の（最後の）1行を `json.loads` でPythonオブジェクトとして保持する
    - その実行結果と `expected_value` を `==` で比較する
7. **結果を返す**
    - 判定を3回行い結果をまとめる
    - 全部Trueなら合格、１つでもFalseなら不合格
    - 3回分の結果と、合否結果をfrontendに返す


