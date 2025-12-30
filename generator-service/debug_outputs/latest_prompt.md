あなたはPythonのプログラミング教育の専門家です。
次のソースコードを題材に、**3問**の「Pythonの文法・処理（syntax）」問題を作成してください。

## 【目的】
ユーザーがソースコード内のロジックを正しく理解し、それを実装できるかを確認すること

## 【クイズ作成ルール】
- 末尾に示すソースコードセクションのコードを題材に問題を作成する
- コードが行っている処理のロジック（仕様）を日本語で説明し、それを実装させるような問題を作成する
- 対象コードに含まれる基本的な文法や処理を問う
- 対象コード内の、**関数定義やクラス定義を含まない、数行の処理** を対象とする


## 【**出力フォーマット**（厳守）】
- 回答は 3 問分の Markdown テキストのみ
- 余計な説明、前置き、例、コード外の文章は一切書かない
- 各問題は必ず行頭から `# n問目` で始める（先頭に空白を入れない）
- 各問題は以下のセクションをこの順番・この名前で出力する（完全一致）
  - `## title`
  - `## statement`
  - `## sysinFormat`
  - `## sampleAnswer`
  - `## testcases`

## 【statement の書き方】
- HTMLタグを直接書く（コードブロックで囲まない）
- 使用可能なタグ: `<p>`, `<code>`, `<ul>`, `<ol>`, `<li>`
- 必ず次を明記する
  - 入力: 実行時に変数 `sysin` が与えられること（stdin の JSON を読み込んで `sysin` に入れる）
  - 処理: 対象コードの関数をどのように実装・呼び出すか

## 【sampleAnswer の書き方】
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


## 【testcases の書き方】
- testcases の中に `### testcase1` / `### testcase2` / `### testcase3` を作る（testcaseは必ず**3つ丁度**）
- 各 testcase の直下に、1 行のインラインコードで JSON を書く
  - `{"sysin": ..., "expected": ...}`
- JSON は厳密に正しいこと（ダブルクオート、true/false/null、末尾カンマ禁止、単一引用符禁止）
- sysin/expected は JSON で表現可能な値のみ（object/array/string/number/bool/null）
- expected は「sampleAnswer が最後に出力する JSON（stdout の最後の非空行を JSON としてパースした値）」である
### OK 例（出力に含めない）:
- `{"sysin": {"a": 1, "b": 2}, "expected": {"a": 2, "b": 3}}`
- `{"sysin": [1, 2, 3], "expected": 6}`
- `{"sysin": null, "expected": null}`
### NG 例（出力に含めない）:
- `{'sysin': {'a': 1}, 'expected': {'a': 2}}` （単一引用符はNG）
- `{"sysin": True, "expected": False}` （True/False はNG。true/false を使う）
- `{"sysin": 1, "expected": 2,}` （末尾カンマはNG）
- `{"sysin": {"a": 1, "b": [1, 2, 3,]}, "expected": {"a": 1, "b": [1, 2, 3]}}` （配列/オブジェクト内の末尾カンマもNG）

## 【**JSON の制約**（重要）】
- sysin / expected / sampleAnswer が出力する値（result）は、JSON の6種類の値のみを使う
  - object / array / string / number / boolean / null
- JSONとして表現できない値（例: set, tuple, bytes, datetime, NaN, Infinity）は使わない

## 【出力例（2問分 / これは例。出力に含めない）】
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
辞書のキーと値の入れ替え

## statement
<p><code>sysin</code> は文字列をキー、数値を値とする辞書です。キーと値を入れ替えた新しい辞書を作り、それを JSON として出力してください。</p>

## sysinFormat
`{"key1": number, "key2": number, ...}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

result = {str(v): k for k, v in sysin.items()}

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"a": 1, "b": 2}, "expected": {"1": "a", "2": "b"}}`
### testcase2
`{"sysin": {}, "expected": {}}`
### testcase3
`{"sysin": {"x": 100}, "expected": {"100": "x"}}`
~~~


## 【ソースコード】
### python_test_code.py
```python
import numpy as np

_EPSILON = 1e-6
class BeatCalc(object):
    # for simplicity, we will represent a "stop" as an impossibly sharp tempo change
    def __init__(self, offset, beat_bpm, beat_stop):
        # ensure all beat markers are strictly increasing
        assert beat_bpm[0][0] == 0.0
        beat_last = -1.0
        bpms = []
        for beat, bpm in beat_bpm:
            assert beat >= beat_last
            if beat == beat_last:
                bpms[-1] = (beat, bpm)
            else:
                bpms.append((beat, bpm))
            beat_last = beat

        # aggregate repeat stops
        stops = {}
        for beat, stop in beat_stop:
            assert beat > 0.0
            if beat in stops:
                stops[beat] += stop
            stops[beat] = stop
        beat_stop = filter(lambda x: x[1] != 0.0, sorted(stops.items(), key=lambda x: x[0]))

        self.offset = offset
        self.bpms = beat_bpm
        self.stops = beat_stop

        beat_bps = [(beat, bpm / 60.0) for beat, bpm in beat_bpm]

        # insert line segments for stops
        for beat, stop in beat_stop:
            seg_idx = np.searchsorted(np.array([x[0] for x in beat_bps]), beat, side='right')
            _, bps = beat_bps[seg_idx - 1]

            beat_bps.insert(seg_idx, (beat + _EPSILON, bps))
            beat_bps.insert(seg_idx, (beat, _EPSILON / stop))

        # create line segments for tempo changes
        time_cum = -offset
        beat_last, bps_last = beat_bps[0]
        times = [-offset]
        for beat, bps in beat_bps[1:]:
            dbeat = beat - beat_last
            dtime = dbeat / bps_last
            time_cum += dtime
            times.append(time_cum)
            beat_last = beat
            bps_last = bps

        self.segment_time = np.array(times)
        self.segment_beat = np.array([beat for beat, _ in beat_bps])
        self.segment_bps = np.array([bps for _, bps in beat_bps])
        self.segment_spb = 1.0 / self.segment_bps

    def beat_to_time(self, beat):
        assert beat >= 0.0
        seg_idx = np.searchsorted(self.segment_beat, beat, side='right') - 1
        beat_left = self.segment_beat[seg_idx]
        time_left = self.segment_time[seg_idx]
        spb = self.segment_spb[seg_idx]
        return time_left + ((beat - beat_left) * spb)

    def time_to_beat(self, time):
        assert time >= 0.0
        seg_idx = np.searchsorted(self.segment_time, time, side='right') - 1
        time_left = self.segment_time[seg_idx]
        beat_left = self.segment_beat[seg_idx]
        bps = self.segment_bps[seg_idx]
        return beat_left + ((time - time_left) * bps)

if __name__ == '__main__':
    bc = BeatCalc(0.05, [(0.0, 120.0), (32.0, 60.0), (64.0, 120.0)], [(16.0, 5.0)])
    print bc.beat_to_time(0.0)
    print bc.beat_to_time(1.0)
    print bc.beat_to_time(8.0)
    print bc.beat_to_time(16.0)
    print bc.beat_to_time(32.0)
    print '-' * 80
    print bc.time_to_beat(0.0)
    print bc.time_to_beat(1.0)
```