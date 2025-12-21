# 1問目
## title
for文とタプルのアンパッキング

## statement
<p><code>sysin</code> は <code>[[beat, bpm], [beat, bpm], ...]</code> という形式の2要素リストのリストです。各要素を <code>for beat, bpm in ...</code> という形で走査し、<code>beat</code> の値だけを順番に取り出して新しいリストを作り、そのリストを JSON として出力してください。</p>
<p>入力: 実行時に変数 <code>sysin</code> が与えられること（stdin の JSON を読み込んで <code>sysin</code> に入れる）</p>
<p>処理: <code>sysin</code> をループし、各 [beat, bpm] から beat のみを取り出してリストにし、最後にそのリストを <code>result</code> に代入して出力してください。</p>

## sysinFormat
<code>[[number, number], [number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beats = []
for beat, bpm in sysin:
    beats.append(beat)

result = beats

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[0.0, 120.0], [1.0, 150.0]], "expected": [0.0, 1.0]}`
### testcase2
`{"sysin": [], "expected": []}`
### testcase3
`{"sysin": [[0, 60], [4, 90], [8, 120]], "expected": [0, 4, 8]}`

# 2問目
## title
辞書への条件付き加算と代入

## statement
<p><code>sysin</code> は <code>[[beat, stop], [beat, stop], ...]</code> という形式の2要素リストのリストです。次のようなロジックを再現してください。</p>
<ul>
<li>空の辞書 <code>stops</code> を用意する</li>
<li>各 [beat, stop] について、もし beat が <code>stops</code> にすでにキーとして存在するなら、その値に stop を加算する</li>
<li>その後、<code>stops[beat]</code> に stop を代入する</li>
</ul>
<p>結果として得られる <code>stops</code> を JSON オブジェクトとして出力してください。</p>
<p>入力: 実行時に変数 <code>sysin</code> が与えられること（stdin の JSON を読み込んで <code>sysin</code> に入れる）</p>
<p>処理: 上記ロジックに従って辞書を構築し、最後の <code>stops</code> を <code>result</code> に代入して出力してください。</p>

## sysinFormat
<code>[[number, number], [number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

stops = {}
for beat, stop in sysin:
    if beat in stops:
        stops[beat] += stop
    stops[beat] = stop

result = stops

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[1.0, 0.5]], "expected": {"1.0": 0.5}}`
### testcase2
`{"sysin": [[2, 1], [2, 3]], "expected": {"2": 3}}`
### testcase3
`{"sysin": [[1, 1], [1, 2], [1, 3]], "expected": {"1": 3}}`

# 3問目
## title
リスト内包表記による要素変換

## statement
<p><code>sysin</code> は <code>[[beat, bpm], [beat, bpm], ...]</code> という形式の2要素リストのリストです。このデータから、<code>(beat, bpm / 60.0)</code> に相当する2要素リスト <code>[beat, bpm/60.0]</code> のリストを、リスト内包表記を使って作成し、JSON として出力してください。</p>
<p>入力: 実行時に変数 <code>sysin</code> が与えられること（stdin の JSON を読み込んで <code>sysin</code> に入れる）</p>
<p>処理: <code>sysin</code> を走査し、各 [beat, bpm] から [beat, bpm/60.0] を生成するリスト内包表記を使ってリストを作成し、それを <code>result</code> に代入して出力してください。</p>

## sysinFormat
<code>[[number, number], [number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

result = [[beat, bpm / 60.0] for beat, bpm in sysin]

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[0.0, 60.0]], "expected": [[0.0, 1.0]]}`
### testcase2
`{"sysin": [[0, 120], [2, 90]], "expected": [[0, 2.0], [2, 1.5]]}`
### testcase3
`{"sysin": [], "expected": []}`