# 1問目
## title
for文とリストの更新（重複ビートの上書き）

## statement
<p><code>sysin</code> は <code>[[beat, bpm], ...]</code> 形式の2次元配列です。次の処理を行い、最終的な <code>bpms</code> リストを出力してください。</p>
<ol>
<li><code>beat_last</code> を <code>-1.0</code>、<code>bpms</code> を空リストとして初期化する。</li>
<li><code>sysin</code> の各要素 <code>[beat, bpm]</code> について、順に以下を行う。</li>
<ul>
<li><code>beat</code> が <code>beat_last</code> 未満であればエラーとする（この問題ではそのような入力は与えられない）。</li>
<li><code>beat</code> が <code>beat_last</code> と等しい場合、<code>bpms</code> の最後の要素を <code>(beat, bpm)</code> で上書きする。</li>
<li>それ以外の場合、<code>bpms</code> に <code>(beat, bpm)</code> を末尾追加する。</li>
<li>最後に <code>beat_last = beat</code> とする。</li>
</ul>
<li>処理後の <code>bpms</code> を JSON 配列として出力する。ただしタプルは配列として表現されるものとし、<code>[[beat, bpm], ...]</code> 形式で出力する。</li>
</ol>

## sysinFormat
<code>[[number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beat_last = -1.0
bpms = []
for beat, bpm in sysin:
    if beat == beat_last:
        bpms[-1] = [beat, bpm]
    else:
        bpms.append([beat, bpm])
    beat_last = beat

result = bpms

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[0.0, 120.0], [32.0, 60.0], [64.0, 120.0]], "expected": [[0.0, 120.0], [32.0, 60.0], [64.0, 120.0]]}`
### testcase2
`{"sysin": [[0.0, 100.0], [0.0, 120.0], [4.0, 150.0]], "expected": [[0.0, 120.0], [4.0, 150.0]]}`
### testcase3
`{"sysin": [], "expected": []}`

# 2問目
## title
辞書を用いたストップ時間の集約

## statement
<p><code>sysin</code> は <code>[[beat, stop], ...]</code> 形式の2次元配列です。次の処理を行い、<code>stops</code> 辞書を JSON オブジェクトとして出力してください。</p>
<ol>
<li><code>stops</code> を空のオブジェクト（辞書）として初期化する。</li>
<li><code>sysin</code> の各要素 <code>[beat, stop]</code> について、順に以下を行う。</li>
<ul>
<li><code>beat</code> は 0 より大きいと仮定する。</li>
<li>もし <code>beat</code> が <code>stops</code> に既に存在するなら、<code>stops[beat]</code> に <code>stop</code> を加算する。</li>
<li>その後、<code>stops[beat] = stop</code> と代入する。</li>
</ul>
<li>最終的な <code>stops</code> を、キーを文字列とした JSON オブジェクトとして出力する（Pythonの辞書をそのままJSON化した形）。</li>
</ol>

## sysinFormat
<code>[[number, number], ...]</code>

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
`{"sysin": [[16.0, 5.0]], "expected": {"16.0": 5.0}}`
### testcase2
`{"sysin": [[4.0, 2.0], [4.0, 3.0]], "expected": {"4.0": 3.0}}`
### testcase3
`{"sysin": [], "expected": {}}`

# 3問目
## title
sortedとfilterによるストップリストの生成

## statement
<p><code>sysin</code> は <code>{"stops": [[beat, stop], ...]}</code> 形式のオブジェクトです。次の処理を行い、その結果のストップリストを出力してください。</p>
<ol>
<li><code>stops</code> を、キーがビート（number）、値がストップ時間（number）の辞書として初期化する。</li>
<li><code>sysin["stops"]</code> の各要素 <code>[beat, stop]</code> について、順に以下を行う。</li>
<ul>
<li>もし <code>beat</code> が <code>stops</code> に既に存在するなら、<code>stops[beat]</code> に <code>stop</code> を加算する。</li>
<li>その後、<code>stops[beat] = stop</code> と代入する。</li>
</ul>
<li><code>stops.items()</code> を <code>beat</code> の昇順でソートした配列を作る。このとき各要素は <code>[beat, stop]</code> 形式の配列とする。</li>
<li>その配列から、<code>stop</code> が 0.0 でない要素だけを残す。</li>
<li>最終的な配列を JSON 配列として出力する。</li>
</ol>

## sysinFormat
<code>{"stops": [[number, number], ...]}</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

raw_stops = sysin.get("stops", [])
stops = {}
for beat, stop in raw_stops:
    if beat in stops:
        stops[beat] += stop
    stops[beat] = stop

items = [[beat, value] for beat, value in stops.items()]
items.sort(key=lambda x: x[0])
result = [item for item in items if item[1] != 0.0]

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"stops": [[16.0, 5.0]]}, "expected": [[16.0, 5.0]]}`
### testcase2
`{"sysin": {"stops": [[4.0, 1.0], [2.0, -1.0], [4.0, 0.0]]}, "expected": [[2.0, -1.0], [4.0, 0.0]]}`
### testcase3
`{"sysin": {"stops": []}, "expected": []}`

# 4問目
## title
リスト内包表記によるBPMからBPSへの変換

## statement
<p><code>sysin</code> は <code>[[beat, bpm], ...]</code> 形式の2次元配列です。次の処理を行い、<code>beat_bps</code> リストを出力してください。</p>
<ol>
<li>各要素 <code>[beat, bpm]</code> について、<code>bpm</code> を毎秒ビート数に変換する（<code>bps = bpm / 60.0</code>）。</li>
<li><code>[beat, bps]</code> からなる新しい配列のリストを作る。</li>
<li>そのリストを JSON 配列として出力する。</li>
</ol>

## sysinFormat
<code>[[number, number], ...]</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beat_bps = [[beat, bpm / 60.0] for beat, bpm in sysin]

result = beat_bps

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[0.0, 120.0]], "expected": [[0.0, 2.0]]}`
### testcase2
`{"sysin": [[0.0, 60.0], [32.0, 120.0]], "expected": [[0.0, 1.0], [32.0, 2.0]]}`
### testcase3
`{"sysin": [], "expected": []}`

# 5問目
## title
for文と累積計算による時間配列の生成

## statement
<p><code>sysin</code> は <code>{"offset": number, "beat_bps": [[beat, bps], ...]}</code> 形式のオブジェクトです。次の処理を行い、<code>times</code> 配列を出力してください。</p>
<ol>
<li><code>time_cum = -offset</code> とし、<code>times = [-offset]</code> として初期化する。</li>
<li><code>beat_last</code> と <code>bps_last</code> を、<code>beat_bps</code> の先頭要素 <code>[beat, bps]</code> の値で初期化する。</li>
<li><code>beat_bps</code> の2番目以降の各要素 <code>[beat, bps]</code> について順に以下を行う。</li>
<ul>
<li><code>dbeat = beat - beat_last</code> を計算する。</li>
<li><code>dtime = dbeat / bps_last</code> を計算する。</li>
<li><code>time_cum += dtime</code> を行う。</li>
<li><code>times</code> に <code>time_cum</code> を末尾追加する。</li>
<li><code>beat_last = beat</code>、<code>bps_last = bps</code> とする。</li>
</ul>
<li>最終的な <code>times</code> を JSON 配列として出力する。</li>
</ol>

## sysinFormat
<code>{"offset": number, "beat_bps": [[number, number], ...]}</code>

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

offset = sysin["offset"]
beat_bps = sysin["beat_bps"]

time_cum = -offset
times = [-offset]
beat_last, bps_last = beat_bps[0]
for beat, bps in beat_bps[1:]:
    dbeat = beat - beat_last
    dtime = dbeat / bps_last
    time_cum += dtime
    times.append(time_cum)
    beat_last = beat
    bps_last = bps

result = times

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"offset": 0.05, "beat_bps": [[0.0, 2.0], [32.0, 1.0]]}, "expected": [-0.05, 15.95]}`
### testcase2
`{"sysin": {"offset": 0.0, "beat_bps": [[0.0, 2.0], [1.0, 2.0]]}, "expected": [0.0, 0.5]}`
### testcase3
`{"sysin": {"offset": 1.0, "beat_bps": [[0.0, 1.0], [2.0, 1.0], [4.0, 1.0]]}, "expected": [-1.0, 1.0, 3.0]}`

# 6問目
## title
searchsortedとインデックス操作によるビートから時間への変換

## statement
<p><code>sysin</code> は <code>{"segment_time": [...], "segment_beat": [...], "segment_spb": [...], "beat": number}</code> 形式のオブジェクトです。ここで各配列は同じ長さを持ち、<code>segment_beat</code> は昇順に並んでいるとします。次の処理を行い、ビートから時間を計算した結果を出力してください（numpy は使わず、組み込みのリストと線形探索で代用してよい）。</p>
<ol>
<li><code>beat</code> が 0.0 以上であると仮定する。</li>
<li><code>segment_beat</code> の中で、<code>beat</code> を挿入する位置を「右側に寄せて」決める（Pythonの <code>bisect</code> モジュールの <code>bisect_right</code> と同じ動作）。</li>
<li>その位置から 1 を引いた値を <code>seg_idx</code> とする。</li>
<li><code>beat_left = segment_beat[seg_idx]</code>、<code>time_left = segment_time[seg_idx]</code>、<code>spb = segment_spb[seg_idx]</code> を取り出す。</li>
<li><code>time_left + ((beat - beat_left) * spb)</code> を計算し、その値を出力する。</li>
</ol>

## sysinFormat
<code>{"segment_time": [number, ...], "segment_beat": [number, ...], "segment_spb": [number, ...], "beat": number}</code>

## sampleAnswer
```python
import sys
import json
import bisect

sysin = json.loads(sys.stdin.read() or "null")

segment_time = sysin["segment_time"]
segment_beat = sysin["segment_beat"]
segment_spb = sysin["segment_spb"]
beat = sysin["beat"]

idx = bisect.bisect_right(segment_beat, beat)
seg_idx = idx - 1
beat_left = segment_beat[seg_idx]
time_left = segment_time[seg_idx]
spb = segment_spb[seg_idx]

result = time_left + ((beat - beat_left) * spb)

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"segment_time": [0.0, 0.5, 1.0], "segment_beat": [0.0, 1.0, 2.0], "segment_spb": [0.5, 0.5, 0.5], "beat": 0.0}, "expected": 0.0}`
### testcase2
`{"sysin": {"segment_time": [0.0, 0.5, 1.0], "segment_beat": [0.0, 1.0, 2.0], "segment_spb": [0.5, 0.5, 0.5], "beat": 0.5}, "expected": 0.25}`
### testcase3
`{"sysin": {"segment_time": [-0.05, 15.95], "segment_beat": [0.0, 32.0], "segment_spb": [0.5, 1.0], "beat": 32.0}, "expected": 15.95}`