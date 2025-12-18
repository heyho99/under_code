# 1問目
## title
dict と for ループによる集計処理

## content_markdown
入力: `sysin` は `{"base": {...}, "files": [...]}` 形式のオブジェクトです。`base` は `{文字列: 数値または数値文字列}` の辞書、`files` は `{"problemCounts": {...}}` という辞書を要素に持つ配列です（`problemCounts` は存在しない場合もあります）。

処理: 以下のルールで、新しい辞書を作って出力してください。

- まず `base` を浅いコピーして開始する（`base` が null の場合は空辞書で開始）
- 各 `file` について、`file["problemCounts"]` を取り出し（存在しない場合や null の場合は空辞書として扱う）、その `items()` を順に処理する
- 各キー `k` と値 `v` について、`int(v)` が
  - 例外を出す場合: その要素は無視する
  - 0 以下の場合: その要素は無視する
  - 正の整数の場合: 現在の出力辞書の同じキーに加算する（キーがなければ 0 から加算）

最終的に得られた辞書を JSON として出力してください。

## sysinFormat
`{"base": object|null, "files": [{"problemCounts": object|null}|object, ...]}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

base = sysin.get("base")
files = sysin.get("files") or []

out = dict(base or {})

for f in files:
    pc = None
    if isinstance(f, dict):
        pc = f.get("problemCounts")
    for k, v in (pc or {}).items():
        try:
            n = int(v)
        except Exception:
            continue
        if n <= 0:
            continue
        out[k] = out.get(k, 0) + n

result = out

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"base": {"a": 1}, "files": [{"problemCounts": {"a": 2, "b": "3"}}, {"problemCounts": {"b": -1, "c": "x"}}]}, "expected": {"a": 3, "b": 3}}`
### testcase2
`{"sysin": {"base": null, "files": [{"problemCounts": {"x": "0"}}, {"problemCounts": {"x": 5}}]}, "expected": {"x": 5}}`
### testcase3
`{"sysin": {"base": {"k": 10}, "files": [{}]}, "expected": {"k": 10}}`

# 2問目
## title
Path を使ったファイルパス結合とテキスト読み込み

## content_markdown
入力: `sysin` は `{"baseDir": "...", "category": "..."}` 形式のオブジェクトです。

処理: 以下のルールで文字列を読み込んで出力してください（実際にはファイルは存在しないので、読み込むべきパス文字列をそのまま出力します）。

- `baseDir` を基準ディレクトリのパス文字列とみなす
- `"prompts"` ディレクトリを `baseDir` に連結し、その中の `"{category}.md"` というファイルパスを作る
- 最終的なフルパスを文字列として JSON 出力する

※ 実際のファイル読み込みは行わず、構築したパス文字列のみを出力してください。

## sysinFormat
`{"baseDir": string, "category": string}`

## sampleAnswer
```python
import sys
import json
from pathlib import Path

sysin = json.loads(sys.stdin.read() or "null")

base_dir = sysin.get("baseDir") or ""
category = sysin.get("category") or ""

prompts_dir = Path(base_dir) / "prompts"
path = prompts_dir / f"{category}.md"

result = str(path)

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"baseDir": "/app/src", "category": "syntax"}, "expected": "/app/src/prompts/syntax.md"}`
### testcase2
`{"sysin": {"baseDir": ".", "category": "math"}, "expected": "prompts/math.md"}`
### testcase3
`{"sysin": {"baseDir": "/tmp", "category": ""}, "expected": "/tmp/prompts/.md"}`

# 3問目
## title
特定カテゴリの数値のみを合計する条件付きループ

## content_markdown
入力: `sysin` は `{"category": "...", "files": [...]}` 形式のオブジェクトです。`files` は `{"fileName": "...", "problemCounts": {...}}` という辞書を要素に持つ配列です。

処理: 次のルールで合計値（number）を計算し、JSON として出力してください。

- 合計値 `files_total` を 0 で初期化する
- 各ファイル `f` の `problemCounts` 辞書を調べ、その `items()` を順に処理する
- 各キー `k` と値 `v` について
  - `int(v)` が例外を出す場合は無視
  - 0 以下なら無視
  - それ以外の正の数値なら、`k` が `category` と等しい場合にのみ合計に加算する
  - `k` が `category` と異なる場合は合計に加算せず無視する
- すべてのファイルを処理し終わったら、`files_total` を出力する

## sysinFormat
`{"category": string, "files": [{"fileName": string, "problemCounts": object|null}, ...]}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

category = sysin.get("category")
files = sysin.get("files") or []

files_total = 0

for f in files:
    pc = None
    if isinstance(f, dict):
        pc = f.get("problemCounts")
    out = 0
    for k, v in (pc or {}).items():
        try:
            n = int(v)
        except Exception:
            continue
        if n <= 0:
            continue
        if k == category:
            out += n
        else:
            # 実際にはログ警告だがここでは何もしない
            pass
    files_total += out

result = files_total

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"category": "syntax", "files": [{"fileName": "a.py", "problemCounts": {"syntax": 2, "style": 3}}, {"fileName": "b.py", "problemCounts": {"syntax": "4"}}]}, "expected": 6}`
### testcase2
`{"sysin": {"category": "style", "files": [{"fileName": "a.py", "problemCounts": {"syntax": 2, "style": 0}}, {"fileName": "b.py", "problemCounts": {"style": "5", "other": "x"}}]}, "expected": 5}`
### testcase3
`{"sysin": {"category": "syntax", "files": [{"fileName": "a.py", "problemCounts": null}]}, "expected": 0}`

# 4問目
## title
空リスト判定と ValueError の代わりの戻り値

## content_markdown
入力: `sysin` は `{"files": [...]} | {"files": []} | {"files": null}` のような形式です。

処理: 次の条件分岐を行い、文字列または数値を JSON として出力してください。

- `files` が存在しない、または空リスト `[]`、または null、または長さ 0 の場合: `"error: at least one file is required"` という文字列を出力する
- それ以外（1件以上のファイルがある場合）: ファイル数（`len(files)`）を数値として出力する

実際のコードでは `ValueError` を送出していますが、この問題では上記のように文字列を返してください。

## sysinFormat
`{"files": array|null}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

files = sysin.get("files")

if not files:
    result = "error: at least one file is required"
else:
    result = len(files)

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"files": []}, "expected": "error: at least one file is required"}`
### testcase2
`{"sysin": {"files": [{"fileName": "a.py"}, {"fileName": "b.py"}]}, "expected": 2}`
### testcase3
`{"sysin": {"files": null}, "expected": "error: at least one file is required"}`

# 5問目
## title
デフォルト値と条件付き代入による数値の初期化

## content_markdown
入力: `sysin` は `{"total": number}` または `{"total": number, "filesTotal": number}` の形式です。

処理: 次のルールで最終的な数値を決め、JSON として出力してください。

- まず `total` を `sysin["total"]` で初期化する
- `filesTotal` を `sysin.get("filesTotal")` で取得する（存在しなければ null）
- もし `filesTotal` が 0 以下であれば、`total` を 5 に上書きする
- それ以外の場合（`filesTotal` が 1 以上のとき、または null のとき）は `total` を変更しない
- 最終的な `total` の値を出力する

## sysinFormat
`{"total": number, "filesTotal": number|null}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

total = sysin.get("total", 0)
files_total = sysin.get("filesTotal")

if isinstance(files_total, (int, float)) and files_total <= 0:
    total = 5

result = total

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"total": 0, "filesTotal": 0}, "expected": 5}`
### testcase2
`{"sysin": {"total": 10, "filesTotal": 3}, "expected": 10}`
### testcase3
`{"sysin": {"total": 7, "filesTotal": null}, "expected": 7}`

# 6問目
## title
リスト内包表記と join による Markdown 文字列生成

## content_markdown
入力: `sysin` は `{"files": [...]}` 形式で、各要素は `{"fileName": string, "content": string}` というオブジェクトです。

処理: 次のルールで Markdown 形式の文字列を作り、JSON の文字列として出力してください。

- 各ファイル `f` について、次の 4 行からなる文字列ブロックを作る  
  1. `### {fileName}`  
  2. ```python  
  3. `content` から末尾の改行文字（`\n`）をすべて取り除いた文字列  
  4. ```  
- これら 4 行は `\n` で結合する
- すべてのファイルブロックを `\n\n`（空行1つ相当）で結合して 1 つの文字列にする
- その結果の文字列を JSON として出力する

## sysinFormat
`{"files": [{"fileName": string, "content": string}, ...]}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

files = sysin.get("files") or []

sources = []
for f in files:
    file_name = f.get("fileName", "")
    content = f.get("content", "")
    block = "\n".join(
        [
            f"### {file_name}",
            "```python",
            content.rstrip("\n"),
            "```",
        ]
    )
    sources.append(block)

source_md = "\n\n".join(sources)

result = source_md

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"files": [{"fileName": "a.py", "content": "print(1)\n"}]}, "expected": "### a.py\n```python\nprint(1)\n```"}`
### testcase2
`{"sysin": {"files": [{"fileName": "a.py", "content": "x = 1\n\n"}, {"fileName": "b.py", "content": "y = 2"}]}, "expected": "### a.py\n```python\nx = 1\n\n```\n\n### b.py\n```python\ny = 2\n```"}`
### testcase3
`{"sysin": {"files": []}, "expected": ""}`