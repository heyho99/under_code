flask --app quiz_poc run --debug

prefixは言語ごとに定義しておけば、文字列を作成できますね。
jsonのオブジェクトをそのままリテラルとして埋め込めない件については、言語側で JSON パースさせるように、文字列でjson＋パースさせるコードをまとめて文字列にすればよいかなと思います。（この意味わかりますか？具体的にコードを書いてみてください）
expectedはjsonオブジェクトでpythonでパースして比較すれば良いと思います。
意味わかります。やりたいことはこうですよね。

**testcase の sysin は「JSON値」**として管理する
paiza に送るコードは、先頭に
sysin を “JSON文字列として埋め込む”
その文字列を実行言語側で JSON パースして sysin 変数を作る という処理（prefix）を足してから、ユーザコード本文を連結する
これなら「JSON を各言語のリテラルに変換して埋め込む」必要がなくなります。

以下、同じ sysin（例: {"a":1,"b":[2,3],"s":"hello"}）を渡す例です。

Python（prefixで JSON パースして sysin を作る）
python
import json
sysin = json.loads(r'''{"a":1,"b":[2,3],"s":"hello"}''')
print(sysin["a"] + sysin["b"][1])
ポイント:

r'''...''' にすると、エスケープ地獄になりにくいです（改行や \ が混じっても比較的安全）
JavaScript / TypeScript（prefixで JSON パースして sysin を作る）
javascript
const sysin = JSON.parse(`{"a":1,"b":[2,3],"s":"hello"}`);
console.log(sysin.a + sysin.b[1]);
ポイント:

バッククォート（テンプレートリテラル）を使うと "..." のエスケープがほぼ不要になります
もし JSON 内にバッククォートが入り得るなら、その場合だけサーバ側で ` を ``` にエスケープしてください（通常の問題入力ではほぼ出ない想定でOKなことが多いです）
Go（prefixで JSON パースして sysin を作る）
Go はトップレベルにそのまま文を置けないので、あなたが package main〜main() を用意して、その中にユーザコードを挿入する形になります。

go
package main
import (
    "encoding/json"
    "fmt"
)
func main() {
    var sysin any
    sysinStr := `{"a":1,"b":[2,3],"s":"hello"}`
    if err := json.Unmarshal([]byte(sysinStr), &sysin); err != nil {
        panic(err)
    }
    m := sysin.(map[string]any)
    b := m["b"].([]any)
    fmt.Println(int(m["a"].(float64)) + int(b[1].(float64)))
}
ポイント:

any に Unmarshal すると、object は map[string]any、array は []any、数値は基本 float64 になります（Goの仕様）
もしここが問題になるなら、問題ごとに struct を定義して sysin を型付きで Unmarshal する方式もあります（ただし汎用性は落ちます）
連結して paiza に送るイメージ（概念）
prefix(lang, sysin_json_string) + "\n" + user_code
sysin_json_string は validator 側で json.dumps(testcase["sysin"]) みたいに作っておく（= JSON文字列化）
expected について
あなたの理解どおりで、expected は validator（Python）で JSON パースして比較でOKです。
実行言語が Go/JS/Python であっても、paiza の stdout が JSON 文字列として出てくるようにしておけば、validator 側（Python）だけで同じ比較ロジックにできます。

状態要約:
sysin は「JSON文字列をコードに埋め込み → 実行言語側で JSON パースして sysin 生成」という prefix を言語別に用意すれば実現可能で、具体例（Python/JS/Go）を提示しました。expected は Python 側で JSON パースして比較する方針で問題ありません。`



## 判定の実装について
1. **expectedとpaiza io apiの出力を各言語のオブジェクトに変換して等号で判定**
      - 言語のあらゆる型を扱えるので理想
      - 各言語へのオブジェクトの変換が困難な言語がある（一応できるっぽいが）
2. **expectedをjsonで表現可能なオブジェクトに限定し、expectedとpaiza io apiはjsonパースして各言語のオブジェクトに変換し、等号で判定**
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
- jsonは値として4種類のデータ型を規定している
   - 文字列：`"..."`
   - 配列：`[...]`
   - オブジェクト：`{...}`
   - bool：`true/false`
   - `null`
- コードやテストケースを含めた各値は、文字列にし、jsonにも文字列として入れて輸送することで、ダンプするだけで解凍が可能
- **今回はtestcaseはjsonオブジェクト**にし、各言語でパースすれば各言語のオブジェクトに変換できるようにする
- コードの実行は`paizaio api`に任せる


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
    - testcase["sysin"] と testcase["expected"] は **json文字列** として扱う
4. **validatorでtestcase["expected"]をパース**
    - `expected_value = json.loads(testcase["expected"])` でPythonオブジェクトとして保持する
5. **validatorで、実行コード文字列（prefix + ユーザ入力コード）を組み立てて実行する**
    - validatorでユーザ入力コードのjsonをパースし、dictに変換（エスケープが解除される）（値はコードの文字列）
    - 実行言語ごとに、testcase["sysin"]（json文字列）を**文字列リテラルとして埋め込み**、paiza上でJSONパースして `sysin` 変数を作る prefix を生成する（validator側ではパースしない）
    - prefix + ユーザ入力コード を `paizaio api` に送信して実行し、stdoutを取得する
6. **判定**
    - stdout の（最後の）1行を `json.loads` でPythonオブジェクトとして保持する
    - その実行結果と `expected_value` を `==` で比較する
7. **結果を返す**
    - 判定を3回行い結果をまとめる
    - 全部Trueなら合格、１つでもFalseなら不合格
    - 3回分の結果と、合否結果をfrontendに返す


