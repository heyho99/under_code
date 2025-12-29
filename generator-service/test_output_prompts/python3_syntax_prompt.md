あなたはPythonのプログラミング教育の専門家です。
次のソースコードを題材に、3問の「Pythonの文法・処理（syntax）」問題を作成してください。

重要: 出力は必ず、問題 3 問分の Markdown テキストのみです。余計な説明や例は絶対に出力しないでください。

【クイズ作成ルール】
- 対象コードに含まれる基本的な文法や処理を問う
- 対象コード内の、**関数定義やクラス定義を含まない、数行の処理** を対象とする
- 対象コード中の特定の行や小さなブロックを抜き出して問題にする
- statement には必ず次を明記する
  - 入力: 実行時に変数 `sysin` が与えられること（stdin の JSON を読み込んで `sysin` に入れる）
  - 処理: 対象コードのロジックをどのように再現するか


【実行環境 / sampleAnswer（Python）】
- sampleAnswer は Python で書く
- sampleAnswer は必ず、stdin の JSON を読み込んで `sysin` を作り、最後に `result` を JSON として 1 行出力する（I/O テンプレを含む）
- （I/O テンプレの最小形 / 出力に含めない）
  ```python
  import sys
  import json
  
  sysin = json.loads(sys.stdin.read() or "null")
  
  # 処理を書く
  result = None  # 最後に result = 値 の形式で結果を保持
  
  print(json.dumps(result, ensure_ascii=False))
  ```
- 追加の print やデバッグ出力は禁止（採点が壊れるため）


【JSON の制約（重要）】
- sysin / expected / sampleAnswer が出力する値（result）は、JSON の6種類の値のみを使う
  - object / array / string / number / boolean / null
- JSONとして表現できない値（例: set, tuple, bytes, datetime, NaN, Infinity）は使わない

【出力フォーマット（厳守）】
- 回答は 3 問分の Markdown テキストのみ
- 余計な説明、前置き、例、コード外の文章は一切書かない
- 各問題は必ず行頭から `# n問目` で始める（先頭に空白を入れない）
- 各問題は以下のセクションをこの順番・この名前で出力する（完全一致）
  - `## title`
  - `## statement`
  - `## sysinFormat`
  - `## sampleAnswer`
  - `## testcases`

【statement の書き方】
- HTMLタグを直接書く（コードブロックで囲まない）
- 使用可能なタグ: <p>, <code>, <ul>, <ol>, <li>

【testcases の書き方】
- testcases の中に `### testcase1` / `### testcase2` / `### testcase3` を作る
- testcaseは必ず **3つ丁度** 作成する
- 各 testcase の直下に、1 行のインラインコードで JSON を書く
  - `{"sysin": ..., "expected": ...}`
- JSON は厳密に正しいこと（ダブルクオート、true/false/null、末尾カンマ禁止、単一引用符禁止）
- sysin/expected は JSON で表現可能な値のみ（object/array/string/number/bool/null）
- expected は「sampleAnswer が最後に出力する JSON（stdout の最後の非空行を JSON としてパースした値）」である

【OK/NG 例（出力に含めない）】
OK:
- `{"sysin": {"a": 1, "b": 2}, "expected": {"a": 2, "b": 3}}`
- `{"sysin": [1, 2, 3], "expected": 6}`
- `{"sysin": null, "expected": null}`

NG:
- `{'sysin': {'a': 1}, 'expected': {'a': 2}}` （単一引用符はNG）
- `{"sysin": True, "expected": False}` （True/False はNG。true/false を使う）
- `{"sysin": 1, "expected": 2,}` （末尾カンマはNG）
- `{"sysin": {"a": 1, "b": [1, 2, 3,]}, "expected": {"a": 1, "b": [1, 2, 3]}}` （配列/オブジェクト内の末尾カンマもNG）


【出力例（2問分 / これは例。出力に含めない）】
~~~markdown
 # 1問目
 ## title
 リスト内包表記によるフィルタリング
 
 ## statement
<p><code>sysin</code> は数値のリストです。偶数だけを残したリストを作り、それを JSON として出力してください。</p>
 
 ## sysinFormat
 `[number, number, ...]`
 
 ## sampleAnswer
 ```python
 import sys
 import json
 
 sysin = json.loads(sys.stdin.read() or "null")
 
 result = [x for x in sysin if x % 2 == 0]
 
 print(json.dumps(result, ensure_ascii=False))
 ```
 
 ## testcases
 ### testcase1
 `{"sysin": [1, 2, 3, 4], "expected": [2, 4]}`
 ### testcase2
 `{"sysin": [], "expected": []}`
 ### testcase3
 `{"sysin": [2, 2, 3], "expected": [2, 2]}`
 
 # 2問目
 ## title
 ステータスコードからレスポンスボディ可否判定
 
 ## statement
<p><code>sysin</code> は <code>{"statusCode": ...}</code> の形式です。次のルールでレスポンスボディを許可するか（true/false）を判定し、JSONとして出力してください。</p>
<ul>
<li>statusCode が null のとき: true</li>
<li>statusCode が "default" / "1XX" / "2XX" / "3XX" / "4XX" / "5XX" のいずれかのとき: true</li>
<li>それ以外: statusCode を整数に変換し、(statusCode &lt; 200) または (204/205/304 のいずれか) のとき false。そうでなければ true</li>
</ul>
 
 ## sysinFormat
 `{"statusCode": number|string|null}`
 
 ## sampleAnswer
 ```python
 import sys
 import json
 
 sysin = json.loads(sys.stdin.read() or "null")
 
 status_code = None
 if isinstance(sysin, dict):
     status_code = sysin.get("statusCode")
 
 if status_code is None:
     result = True
 elif status_code in {"default", "1XX", "2XX", "3XX", "4XX", "5XX"}:
     result = True
 else:
     current_status_code = int(status_code)
     result = not (current_status_code < 200 or current_status_code in {204, 205, 304})
 
 print(json.dumps(result, ensure_ascii=False))
 ```
 
 ## testcases
 ### testcase1
 `{"sysin": {"statusCode": null}, "expected": true}`
 ### testcase2
 `{"sysin": {"statusCode": "2XX"}, "expected": true}`
 ### testcase3
 `{"sysin": {"statusCode": 204}, "expected": false}`
~~~


リクエストタイトル: テストクイズタイトル
リクエスト説明: このクイズはテスト用に作成されたものです。

対象コード:
### example.py
```python
def calculate_sum(numbers):
    """リストの合計を計算する"""
    total = 0
    for num in numbers:
        total += num
    return total

def filter_even(numbers):
    """偶数だけをフィルタリング"""
    return [n for n in numbers if n % 2 == 0]
```