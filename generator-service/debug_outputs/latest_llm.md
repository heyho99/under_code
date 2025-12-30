# 1問目
## title
docker compose コマンド文字列から <code>-f</code> オプションで指定されたファイルパスを抽出する処理

## statement
<p><code>sysin</code> は 1 つの文字列です。この文字列は docker compose のコマンド例を表し、<code>-f</code> オプションで compose ファイルのパスが指定されている場合があります。</p>
<p>次の仕様で処理を行い、その結果を JSON として出力してください。</p>
<ul>
  <li><code>sysin</code> をスペース区切りで分割し、コマンドの引数配列を作成する（<code>strings.Fields</code> 相当の挙動）。</li>
  <li>左から順に引数を走査し、要素が <code>"-f"</code> であり、かつその直後に要素が存在する場合、その直後の要素（ファイルパス文字列）を結果スライスに追加する。</li>
  <li>すべての引数を確認したあと、集めたファイルパスのスライスをそのまま JSON として出力する。</li>
  <li><code>-f</code> が 1 つも見つからなかった場合は、空スライス <code>[]</code> を JSON として出力する。</li>
</ul>
<p>入力: 実行時に stdin の JSON を読み込み、それを変数 <code>sysin</code> として扱う。<code>sysin</code> は文字列である。</p>
<p>処理: 上記仕様に従って Go で実装し、最終的なスライスを <code>result</code> として 1 行の JSON で出力する。</p>

## sysinFormat
`"docker compose -f docker-compose.yml -f docker-compose.override.yml up"`

## sampleAnswer
```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
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

	cmdStr, ok := sysin.(string)
	if !ok {
		panic("sysin must be string")
	}

	cmdArgs := strings.Fields(cmdStr)
	paths := []string{}

	for i := 0; i < len(cmdArgs); i++ {
		if cmdArgs[i] == "-f" && i+1 < len(cmdArgs) {
			paths = append(paths, cmdArgs[i+1])
		}
	}

	var result interface{} = paths

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": "docker compose -f docker-compose.yml up", "expected": ["docker-compose.yml"]}`
### testcase2
`{"sysin": "docker compose -f a.yml -f b.yml -f c.yml up -d", "expected": ["a.yml", "b.yml", "c.yml"]}`
### testcase3
`{"sysin": "docker compose up -d", "expected": []}`

# 2問目
## title
docker compose up コマンドへのフラグ挿入（<code>--abort-on-container-exit</code> / <code>--exit-code-from</code>）

## statement
<p><code>sysin</code> は 2 要素の配列です。</p>
<ul>
  <li>0 番目: docker compose コマンド文字列（例: <code>"docker compose up -d"</code>）</li>
  <li>1 番目: サービス名を表す文字列（例: <code>"web"</code>、空文字列のこともある）</li>
</ul>
<p>次の仕様で処理を行い、その結果のコマンド文字列を JSON として出力してください。</p>
<ol>
  <li>まず、0 番目の文字列（コマンド）に <code>"--abort-on-container-exit"</code> または <code>"--exit-code-from"</code> が既に部分文字列として含まれているかを確認する。いずれかが含まれている場合は、そのコマンド文字列をそのまま結果として返す。</li>
  <li>含まれていない場合は、コマンド文字列をスペース区切りで分割し、トークン配列を得る（<code>strings.Fields</code> 相当）。</li>
  <li>トークンの中から最初に現れる <code>"up"</code> という要素を探し、その直後に以下のフラグ群を挿入する。</li>
</ol>
<ul>
  <li>必ず挿入するフラグ: <code>--abort-on-container-exit</code></li>
  <li>1 番目のサービス名文字列が空でない場合のみ、さらにその後ろに <code>--exit-code-from</code> とサービス名を続けて挿入する。</li>
</ul>
<ol start="4">
  <li>フラグ挿入後、トークン配列をスペース区切りで再結合して 1 つの文字列にし、それを結果とする。</li>
  <li>トークン配列中に <code>"up"</code> が 1 度も出てこない場合は、元のコマンド文字列をそのまま結果とする。</li>
</ol>
<p>入力: 実行時に stdin の JSON を読み込み、それを変数 <code>sysin</code> として扱う。<code>sysin</code> は長さ 2 の配列であり、0 番目・1 番目はいずれも文字列である。</p>
<p>処理: 上記仕様に従って Go で実装し、最終的なコマンド文字列を <code>result</code> として 1 行の JSON で出力する。</p>

## sysinFormat
`["docker compose up -d", "web"]`

## sampleAnswer
```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
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

	arr, ok := sysin.([]interface{})
	if !ok || len(arr) != 2 {
		panic("sysin must be array length 2")
	}

	appCmd, ok1 := arr[0].(string)
	serviceName, ok2 := arr[1].(string)
	if !ok1 || !ok2 {
		panic("elements must be strings")
	}

	if strings.Contains(appCmd, "--abort-on-container-exit") || strings.Contains(appCmd, "--exit-code-from") {
		out, err := json.Marshal(appCmd)
		if err != nil {
			panic(err)
		}
		fmt.Println(string(out))
		return
	}

	args := []string{"--abort-on-container-exit"}
	if serviceName != "" {
		args = append(args, "--exit-code-from", serviceName)
	}

	parts := strings.Fields(appCmd)
	for i, p := range parts {
		if p == "up" {
			newParts := make([]string, 0, len(parts)+len(args))
			newParts = append(newParts, parts[:i+1]...)
			newParts = append(newParts, args...)
			newParts = append(newParts, parts[i+1:]...)
			appCmd = strings.Join(newParts, " ")
			break
		}
	}

	var result interface{} = appCmd

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": ["docker compose up -d", "web"], "expected": "docker compose up --abort-on-container-exit --exit-code-from web -d"}`
### testcase2
`{"sysin": ["docker compose up", ""], "expected": "docker compose up --abort-on-container-exit"}`
### testcase3
`{"sysin": ["docker compose --abort-on-container-exit up -d", "api"], "expected": "docker compose --abort-on-container-exit up -d"}`

# 1問目
## title
辞書への集約とフィルタ、ソートの実装

## statement
<p><code>sysin</code> は、<code>[ [beat, stop], [beat, stop], ... ]</code> という形式の2要素リストのリストです。ここで <code>beat</code> は数値、<code>stop</code> も数値です。</p>
<p>次の処理を行い、その結果を JSON として出力してください。</p>
<ul>
<li>まず空の辞書 <code>stops</code> を用意し、<code>sysin</code> の各要素 <code>[beat, stop]</code> について順に処理します。</li>
<li><code>assert beat > 0.0</code> に相当するチェックを行い、条件を満たさない場合は <code>AssertionError</code> を送出してください。</li>
<li>もし <code>beat</code> がすでに辞書 <code>stops</code> のキーとして存在する場合、そのキーに対応する値に <code>stop</code> を加算します。</li>
<li>その後、キー <code>beat</code> に対して値 <code>stop</code> を代入します（つまり、同じ beat の最後の stop 値で上書きされるコードの挙動を再現します）。</li>
<li>すべての要素を処理したあと、<code>stops</code> の各 <code>(beat, stop)</code> のペアを <code>stop != 0.0</code> でフィルタし、さらに <code>beat</code> の昇順でソートしたリストを作成します。</li>
</ul>
<p>最終的に、このフィルタ・ソート後の <code>[ [beat, stop], ... ]</code> のリストを <code>result</code> として JSON 出力してください。</p>
<p>入力: 実行時に stdin の JSON を読み込み、<code>sysin</code> 変数に代入されます。</p>
<p>処理: 上記仕様に従って辞書操作・条件分岐・ソートを行い、結果リストを作って出力してください。</p>

## sysinFormat
`[[number, number], [number, number], ...]`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

stops = {}
for beat, stop in sysin:
    assert beat > 0.0
    if beat in stops:
        stops[beat] += stop
    stops[beat] = stop

items = list(stops.items())
items = [x for x in items if x[1] != 0.0]
items.sort(key=lambda x: x[0])

result = [[beat, stop] for beat, stop in items]

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[16.0, 5.0]], "expected": [[16.0, 5.0]]}`
### testcase2
`{"sysin": [[4.0, 1.0], [4.0, -1.0], [8.0, 2.0]], "expected": [[4.0, -1.0], [8.0, 2.0]]}`
### testcase3
`{"sysin": [[3.0, 0.0], [1.0, 2.0], [2.0, 0.5]], "expected": [[1.0, 2.0], [2.0, 0.5]]}`

# 2問目
## title
累積時間の計算とリストへの追加

## statement
<p><code>sysin</code> は <code>[ [beat, bps], [beat, bps], ... ]</code> という形式の2要素リストのリストです。ここで <code>beat</code> はビート位置、<code>bps</code> は1秒あたりのビート数 (beats per second) を表す数値です。また、オフセット値 <code>offset</code> は 0.05 に固定とします。</p>
<p>次の処理を行い、その結果を JSON として出力してください。</p>
<ol>
<li><code>time_cum</code> という変数に <code>-offset</code> を代入します。</li>
<li><code>beat_last</code> と <code>bps_last</code> に、それぞれ <code>sysin[0]</code> の <code>beat</code> と <code>bps</code> を代入します。</li>
<li><code>times</code> というリストを作成し、最初の要素として <code>-offset</code> を入れます。</li>
<li><code>sysin</code> の先頭要素を除いた残りの要素について、順に以下を行います。
  <ul>
    <li>現在の <code>beat</code> と以前の <code>beat_last</code> の差 <code>dbeat</code> を計算します。</li>
    <li><code>dtime = dbeat / bps_last</code> を計算し、<code>time_cum</code> に加算します。</li>
    <li>更新された <code>time_cum</code> を <code>times</code> リストの末尾に追加します。</li>
    <li><code>beat_last</code> と <code>bps_last</code> を現在の要素の <code>beat</code> と <code>bps</code> に更新します。</li>
  </ul>
</li>
<li>最終的な <code>times</code> リストを <code>result</code> として JSON 出力してください。</li>
</ol>
<p>入力: 実行時に stdin の JSON を読み込み、<code>sysin</code> 変数に代入されます。</p>
<p>処理: 上記仕様に従って、ループ・変数更新・リストへの追加を用いて累積時間を計算してください。</p>

## sysinFormat
`[[number, number], [number, number], ...]`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

offset = 0.05

time_cum = -offset
beat_last, bps_last = sysin[0]
times = [-offset]

for beat, bps in sysin[1:]:
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
`{"sysin": [[0.0, 2.0], [1.0, 2.0]], "expected": [-0.05, 0.45]}`
### testcase2
`{"sysin": [[0.0, 2.0], [2.0, 1.0]], "expected": [-0.05, 0.95]}`
### testcase3
`{"sysin": [[0.0, 1.0], [1.0, 2.0], [2.0, 2.0]], "expected": [-0.05, 0.95, 1.45]}`

# 3問目
## title
区間検索と線形補間の実装

## statement
<p><code>sysin</code> は次の形式のオブジェクトです。</p>
<ul>
<li><code>segment_beat</code>: ビート位置を表す数値の配列（昇順ソート済み）</li>
<li><code>segment_time</code>: 各ビート位置に対応する時刻（秒）を表す数値の配列</li>
<li><code>segment_spb</code>: 各区間における1ビートあたりの時間（seconds per beat）を表す数値の配列</li>
<li><code>beat</code>: 時刻に変換したいビート位置（数値）</li>
</ul>
<p>元コードの <code>beat_to_time</code> メソッドの処理ロジックを、関数定義を使わずにそのままスクリプトとして実装してください。具体的には次を行います。</p>
<ol>
<li><code>beat</code> が 0.0 以上であることを <code>assert beat >= 0.0</code> で確認します。</li>
<li><code>segment_beat</code> の中から、<code>beat</code> が入る位置のインデックス <code>seg_idx</code> を「右側に挿入する位置 - 1」という形で求めます（<code>numpy.searchsorted(..., side='right') - 1</code> と同じ動作を、標準的な Python のループと条件分岐で実装してください）。</li>
<li><code>beat_left = segment_beat[seg_idx]</code>、<code>time_left = segment_time[seg_idx]</code>、<code>spb = segment_spb[seg_idx]</code> を取得します。</li>
<li><code>time_left + ((beat - beat_left) * spb)</code> を計算し、その値を <code>result</code> として JSON 出力してください。</li>
</ol>
<p>入力: 実行時に stdin の JSON を読み込み、<code>sysin</code> 変数に代入されます。</p>
<p>処理: 上記仕様に従って、インデックス探索と線形補間の計算を行ってください（<code>numpy</code> は使用せず、リストとループのみを使って実装します）。</p>

## sysinFormat
`{"segment_beat": [number, ...], "segment_time": [number, ...], "segment_spb": [number, ...], "beat": number}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

segment_beat = sysin["segment_beat"]
segment_time = sysin["segment_time"]
segment_spb = sysin["segment_spb"]
beat = sysin["beat"]

assert beat >= 0.0

pos = 0
for i, b in enumerate(segment_beat):
    if beat < b:
        pos = i
        break
else:
    pos = len(segment_beat)

seg_idx = pos - 1

beat_left = segment_beat[seg_idx]
time_left = segment_time[seg_idx]
spb = segment_spb[seg_idx]

result = time_left + ((beat - beat_left) * spb)

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"segment_beat": [0.0, 4.0], "segment_time": [0.0, 2.0], "segment_spb": [0.5, 1.0], "beat": 1.0}, "expected": 0.5}`
### testcase2
`{"sysin": {"segment_beat": [0.0, 2.0, 4.0], "segment_time": [0.0, 1.0, 3.0], "segment_spb": [0.5, 1.0, 0.5], "beat": 3.0}, "expected": 2.0}`
### testcase3
`{"sysin": {"segment_beat": [0.0, 1.0], "segment_time": [0.0, 0.5], "segment_spb": [0.5, 0.5], "beat": 0.0}, "expected": 0.0}`