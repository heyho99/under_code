# 1問目
## title
辞書とリストを使った集計処理

## statement
<p><code>sysin</code> は <code>{"base": {...}, "files": [...]}</code> 形式のオブジェクトです。<code>base</code> は文字列キー・数値または文字列値の辞書、<code>files</code> は <code>{"problemCounts": {...}}</code> を持つオブジェクトの配列とします。</p>
<p>次のロジックを実装して、集計結果の辞書を JSON として出力してください。</p>
<ul>
<li>まず <code>base</code> をコピーして <code>out</code> 辞書を作る。<code>base</code> が null の場合は空辞書とする。</li>
<li><code>files</code> の各要素 <code>f</code> について、<code>f["problemCounts"]</code> を取り出し、null の場合は空辞書とみなす。</li>
<li>その辞書の各 <code>(k, v)</code> について:
  <ul>
    <li><code>v</code> を <code>int(v)</code> として整数に変換しようとする。変換に失敗したらそのキーは無視する。</li>
    <li>変換後の値 <code>n</code> が 0 以下なら無視する。</li>
    <li>それ以外の場合、<code>out[k]</code> に <code>n</code> を加算する（<code>out</code> にキーが無ければ 0 から加算）。</li>
  </ul>
</li>
<li>最終的な <code>out</code> をそのまま JSON として出力する。</li>
</ul>

## sysinFormat
`{"base": {"key": number|string, ...}|null, "files": [{"problemCounts": {"key": number|string, ...}|null}, ...]}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

base = sysin.get("base")
files = sysin.get("files") or []

out = dict(base or {})

for f in files:
    pc = (f or {}).get("problemCounts") or {}
    for k, v in pc.items():
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
`{"sysin": {"base": {"a": 1}, "files": [{"problemCounts": {"a": 2, "b": 3}}]}, "expected": {"a": 3, "b": 3}}`
### testcase2
`{"sysin": {"base": null, "files": [{"problemCounts": {"a": "5", "b": "x"}}, {"problemCounts": {"a": 1}}]}, "expected": {"a": 6}}`
### testcase3
`{"sysin": {"base": {"a": 10}, "files": [{"problemCounts": null}, {"problemCounts": {"a": 0, "b": -1}}]}, "expected": {"a": 10}}`

# 2問目
## title
Path オブジェクトと文字列フォーマットを使ったファイルパス生成

## statement
<p><code>sysin</code> は文字列 <code>category</code> です。現在のファイルのパスを <code>__file__</code> と仮定し、次のロジックを実行して、最終的なパスを文字列として JSON 出力してください。</p>
<ul>
<li><code>__file__</code> を <code>"./dummy/current_file.py"</code> という文字列とみなす。</li>
<li><code>Path(__file__).resolve()</code> の親ディレクトリのさらに親ディレクトリ（<code>parent.parent</code>）を基準ディレクトリとする。</li>
<li>基準ディレクトリの中の <code>"prompts"</code> ディレクトリのパスを作る。</li>
<li>その中の <code>f"{category}.md"</code> というファイル名のパスを作る。</li>
<li>そのパスを文字列に変換して JSON として出力する。</li>
</ul>

## sysinFormat
`string`

## sampleAnswer
```python
import sys
import json
from pathlib import Path

sysin = json.loads(sys.stdin.read() or "null")

category = sysin
fake_file = "./dummy/current_file.py"
base = Path(fake_file).resolve().parent.parent
prompts_dir = base / "prompts"
path = prompts_dir / f"{category}.md"

result = str(path)

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": "syntax", "expected": "prompts/syntax.md"}`
### testcase2
`{"sysin": "logic", "expected": "prompts/logic.md"}`
### testcase3
`{"sysin": "test_category", "expected": "prompts/test_category.md"}`

# 3問目
## title
ネストした関数でのローカル変数の加算処理

## statement
<p><code>sysin</code> は <code>{"items": [...], "category": "..."}</code> 形式のオブジェクトです。次のロジックを実装して、合計値を JSON の数値として出力してください。</p>
<ul>
<li><code>items</code> は <code>{"problemCounts": {...}}</code> を持つオブジェクトの配列とする。</li>
<li><code>category</code> は文字列とする。</li>
<li>内部関数 <code>_sum_for_category(d: dict|None)</code> を定義し、次のように動作させる:
  <ul>
    <li>ローカル変数 <code>out = 0</code> から開始する。</li>
    <li><code>d</code> が null のときは空辞書として扱う。</li>
    <li><code>d</code> の各 <code>(k, v)</code> について:
      <ul>
        <li><code>v</code> を <code>int(v)</code> に変換し、失敗したら無視する。</li>
        <li>変換後の値 <code>n</code> が 0 以下なら無視する。</li>
        <li><code>k</code> が外側スコープの <code>category</code> と等しいときだけ、<code>out</code> に <code>n</code> を加算する。</li>
      </ul>
    </li>
    <li>最後に <code>out</code> を返す。</li>
  </ul>
</li>
<li>外側ではローカル変数 <code>files_total = 0</code> を 0 で初期化する。</li>
<li><code>items</code> の各要素 <code>f</code> について、<code>_sum_for_category(f["problemCounts"])</code> を呼び、その戻り値を <code>files_total</code> に加算する。</li>
<li>最終的な <code>files_total</code> を JSON として出力する。</li>
</ul>

## sysinFormat
`{"items": [{"problemCounts": {"key": number|string, ...}|null}, ...], "category": string}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

items = sysin.get("items") or []
category = sysin.get("category")

def _sum_for_category(d):
    out = 0
    for k, v in (d or {}).items():
        try:
            n = int(v)
        except Exception:
            continue
        if n <= 0:
            continue
        if k == category:
            out += n
    return out

files_total = 0
for f in items:
    pc = (f or {}).get("problemCounts")
    files_total += _sum_for_category(pc)

result = files_total

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"items": [{"problemCounts": {"syntax": 2, "logic": 3}}, {"problemCounts": {"syntax": "4"}}], "category": "syntax"}, "expected": 6}`
### testcase2
`{"sysin": {"items": [{"problemCounts": {"logic": 1}}, {"problemCounts": null}], "category": "syntax"}, "expected": 0}`
### testcase3
`{"sysin": {"items": [{"problemCounts": {"syntax": -1, "syntax2": 5}}, {"problemCounts": {"syntax": 3, "syntax": "2"}}], "category": "syntax"}, "expected": 5}`

# 4問目
## title
デフォルト値付き引数と条件分岐による値の補正

## statement
<p><code>sysin</code> は <code>{"files": [...], "category": "...", "fallbackTotal": number}</code> 形式のオブジェクトです。次のロジックを利用して、最終的な <code>total</code> を JSON 数値として出力してください。</p>
<ul>
<li>まず、前問で定義したのと同等の <code>_sum_for_category</code> ロジックで、<code>files</code> 配列の各要素 <code>f</code> の <code>problemCounts</code> から、<code>category</code> に一致するキーの正の値だけを合計し、その合計を <code>total</code> とする。</li>
<li><code>total</code> が 0 以下のときは、<code>fallbackTotal</code> の値を <code>total</code> として使う。</li>
<li>最終的な <code>total</code> を JSON で出力する。</li>
</ul>

## sysinFormat
`{"files": [{"problemCounts": {"key": number|string, ...}|null}, ...], "category": string, "fallbackTotal": number}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

files = sysin.get("files") or []
category = sysin.get("category")
fallback_total = sysin.get("fallbackTotal", 5)

def _sum_for_category(d):
    out = 0
    for k, v in (d or {}).items():
        try:
            n = int(v)
        except Exception:
            continue
        if n <= 0:
            continue
        if k == category:
            out += n
    return out

total = 0
for f in files:
    pc = (f or {}).get("problemCounts")
    total += _sum_for_category(pc)

if total <= 0:
    total = fallback_total

result = total

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"files": [{"problemCounts": {"syntax": 1}}, {"problemCounts": {"syntax": 2}}], "category": "syntax", "fallbackTotal": 5}, "expected": 3}`
### testcase2
`{"sysin": {"files": [{"problemCounts": {"syntax": 0}}, {"problemCounts": {"logic": 2}}], "category": "syntax", "fallbackTotal": 5}, "expected": 5}`
### testcase3
`{"sysin": {"files": [], "category": "syntax", "fallbackTotal": 10}, "expected": 10}`

# 5問目
## title
リストへの文字列追加と join による複数ソースの結合

## statement
<p><code>sysin</code> は <code>{"files": [...]}</code> 形式のオブジェクトです。<code>files</code> は <code>{"fileName": "...", "content": "..."}</code> を持つオブジェクトの配列とします。次のロジックを実装し、最終的な結合済み文字列を JSON の文字列として出力してください。</p>
<ul>
<li>空のリスト <code>sources</code> を作成する。</li>
<li><code>files</code> の各要素 <code>f</code> について、次の 4 行からなる文字列ブロックを作成し、<code>sources</code> に追加する:
  <ul>
    <li><code>f"### {f['fileName']}"</code></li>
    <li><code>"```python"</code></li>
    <li><code>f["content"].rstrip("\n")</code></li>
    <li><code>"```"</code></li>
  </ul>
  これら 4 行を <code>"\n"</code> で連結して 1 つの文字列にする。</li>
<li>最後に、<code>sources</code> の要素を <code>"\n\n"</code> で連結した文字列を作成し、それを JSON として出力する。</li>
</ul>

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
    block = "\n".join(
        [
            f"### {f['fileName']}",
            "```python",
            f["content"].rstrip("\n"),
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
`{"sysin": {"files": [{"fileName": "a.py", "content": "print(1)\n\n"}, {"fileName": "b.py", "content": "x = 2"}]}, "expected": "### a.py\n```python\nprint(1)\n```\n\n### b.py\n```python\nx = 2\n```"}`
### testcase3
`{"sysin": {"files": []}, "expected": ""}`

# 6問目
## title
辞書の生成と文字列の置換処理

## statement
<p><code>sysin</code> は <code>{"template": "...", "total": number, "title": string|null, "description": string|null, "source": string}</code> 形式のオブジェクトです。次のロジックを実装して、テンプレート文字列の置換結果を JSON の文字列として出力してください。</p>
<ul>
<li><code>template</code> は文字列とする。</li>
<li><code>total</code> は数値、<code>title</code>, <code>description</code>, <code>source</code> は文字列または null とする。</li>
<li><code>title</code> と <code>description</code> が null のときは空文字列として扱う。</li>
<li>次の内容を持つ辞書 <code>replacements</code> を作成する:
  <ul>
    <li><code>"__GENERATOR_PROMPT_TOTAL__"</code>: <code>str(total)</code></li>
    <li><code>"__GENERATOR_PROMPT_TITLE__"</code>: <code>title</code>（null の場合は ""）</li>
    <li><code>"__GENERATOR_PROMPT_DESCRIPTION__"</code>: <code>description</code>（null の場合は ""）</li>
    <li><code>"__GENERATOR_PROMPT_SOURCE_MD__"</code>: <code>source</code></li>
  </ul>
</li>
<li><code>template</code> に対して、<code>replacements.items()</code> の各 <code>(k, v)</code> について順に <code>template = template.replace(k, v)</code> を行う。</li>
<li>最終的な <code>template</code> を JSON として出力する。</li>
</ul>

## sysinFormat
`{"template": string, "total": number, "title": string|null, "description": string|null, "source": string}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

template = sysin.get("template", "")
total = sysin.get("total", 0)
title = sysin.get("title") or ""
description = sysin.get("description") or ""
source_md = sysin.get("source", "")

replacements = {
    "__GENERATOR_PROMPT_TOTAL__": str(total),
    "__GENERATOR_PROMPT_TITLE__": title,
    "__GENERATOR_PROMPT_DESCRIPTION__": description,
    "__GENERATOR_PROMPT_SOURCE_MD__": source_md,
}

for k, v in replacements.items():
    template = template.replace(k, v)

result = template

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"template": "total=__GENERATOR_PROMPT_TOTAL__", "total": 5, "title": null, "description": null, "source": ""}, "expected": "total=5"}`
### testcase2
`{"sysin": {"template": "__GENERATOR_PROMPT_TITLE__:__GENERATOR_PROMPT_DESCRIPTION__", "total": 1, "title": "t", "description": "d", "source": "s"}, "expected": "t:d"}`
### testcase3
`{"sysin": {"template": "__GENERATOR_PROMPT_SOURCE_MD__ (__GENERATOR_PROMPT_TOTAL__)", "total": 3, "title": null, "description": null, "source": "SRC"}, "expected": "SRC (3)"}`