# 1問目
## title
for文とタプルのアンパック代入

## statement
<p><code>sysin</code> は <code>[[beat, bpm], ...]</code> という形式の数値の2要素リストからなるリストです。これは次のコード断片と同じ構造を持つとします。</p>
<p><code>for beat, bpm in beat_bpm:</code></p>
<p>このコードと同様に、各要素を <code>beat</code> と <code>bpm</code> という2つの変数にアンパックしながら for ループで回し、<code>(beat, bpm)</code> のタプルを新しいリストに順番に追加してください。その結果のリストを JSON で出力してください。</p>
<p>入力: 実行時に stdin から JSON を読み込み、<code>sysin</code> 変数にリストとして格納されます。</p>
<p>処理: 上記仕様どおり for 文とアンパック代入を用いて処理し、結果を <code>result</code> に代入して出力してください。</p>

## sysinFormat
<code>[[number, number], [number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beat_bpm = sysin
bpms = []
for beat, bpm in beat_bpm:
    bpms.append((beat, bpm))

result = bpms

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[0.0, 120.0], [32.0, 60.0]], "expected": [[0.0, 120.0], [32.0, 60.0]]}`
### testcase2
`{"sysin": [], "expected": []}`
### testcase3
`{"sysin": [[1.5, 90.0]], "expected": [[1.5, 90.0]]}`

# 2問目
## title
辞書への条件付き代入と累積加算

## statement
<p><code>sysin</code> は <code>[[beat, stop], ...]</code> という形式の数値の2要素リストからなるリストです。次のコード断片と類似の処理を実装してください。</p>
<ul>
<li>空の辞書 <code>stops = {}</code> を用意する。</li>
<li><code>for beat, stop in beat_stop:</code> としてループを回す。</li>
<li>同じ <code>beat</code> キーが既に辞書にある場合、その値に <code>stop</code> を加算する。</li>
<li>その後、常に <code>stops[beat] = stop</code> の代入を行う。</li>
</ul>
<p>最終的に出来上がった <code>stops</code> 辞書を JSON として出力してください。</p>
<p>入力: stdin の JSON を読み込み、<code>sysin</code> に代入されます。</p>
<p>処理: 上記仕様どおりに for 文・条件分岐・辞書代入を実装し、その辞書を <code>result</code> に格納して出力してください。</p>

## sysinFormat
<code>[[number, number], [number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beat_stop = sysin
stops = {}
for beat, stop in beat_stop:
    if beat in stops:
        stops[beat] += stop
    stops[beat] = stop

result = stops

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[16.0, 5.0]], "expected": {"16.0": 5.0}}`
### testcase2
`{"sysin": [[1.0, 2.0], [1.0, 3.0]], "expected": {"1.0": 3.0}}`
### testcase3
`{"sysin": [[1.0, 2.0], [2.0, 1.0], [1.0, -1.0]], "expected": {"1.0": -1.0, "2.0": 1.0}}`

# 3問目
## title
リスト内包表記と for ループの書き換え

## statement
<p>次のようなリスト内包表記があります。</p>
<p><code>segment_beat = [beat for beat, _ in beat_bps]</code></p>
<p><code>sysin</code> は <code>[[beat, bps], ...]</code> という形式の2要素リストからなるリストです。このリスト内包表記と同じ結果を、通常の for ループと <code>append</code> を使って実装し、得られた <code>segment_beat</code> リストを JSON で出力してください。</p>
<p>入力: stdin の JSON を読み込み、<code>sysin</code> に代入します。</p>
<p>処理: <code>for beat, _ in beat_bps:</code> の形でアンパックし、各 <code>beat</code> を新しいリストに追加していき、そのリストを <code>result</code> に格納して出力してください。</p>

## sysinFormat
<code>[[number, number], [number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beat_bps = sysin
segment_beat = []
for beat, _ in beat_bps:
    segment_beat.append(beat)

result = segment_beat

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[0.0, 2.0], [32.0, 1.0], [64.0, 2.0]], "expected": [0.0, 32.0, 64.0]}`
### testcase2
`{"sysin": [], "expected": []}`
### testcase3
`{"sysin": [[10.5, 3.0]], "expected": [10.5]}`