# 1問目
## title
文字列の分割とコマンド引数からのパス抽出

## statement
<p><code>sysin</code> は文字列で、Docker Compose コマンドが 1 行で渡されます。次の Go コードのロジックを再現してください。</p>
<p><code>cmdArgs := strings.Fields(cmd)</code> で文字列をスペース区切りにし、<code>for i := 0; i &lt; len(cmdArgs); i++ { ... }</code> のループで <code>"-f"</code> の直後の要素を順番に <code>composePaths</code> スライスへ <code>append</code> してください。</p>
<p>最終的に <code>composePaths</code> を JSON 配列として出力します。<code>"-f"</code> が 1 つも無い場合は空配列 <code>[]</code> を出力してください。</p>
<p>入力: stdin の JSON を読み込んで <code>sysin</code>（string）とする。</p>
<p>処理: 上記のループと <code>strings.Fields</code> を模したロジックで、<code>"-f"</code> オプションの直後の引数を全て配列に集めて出力する。</p>

## sysinFormat
`string`

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
	var sysin string
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	cmd := sysin
	cmdArgs := strings.Fields(cmd)
	composePaths := []string{}

	for i := 0; i < len(cmdArgs); i++ {
		if cmdArgs[i] == "-f" && i+1 < len(cmdArgs) {
			composePaths = append(composePaths, cmdArgs[i+1])
		}
	}

	var result interface{} = composePaths

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": "docker compose -f a.yml -f b.yml up", "expected": ["a.yml", "b.yml"]}`
### testcase2
`{"sysin": "docker compose up", "expected": []}`
### testcase3
`{"sysin": "docker compose -f file.yml run test", "expected": ["file.yml"]}`

# 2問目
## title
文字列の部分一致とスライスへの挿入位置制御

## statement
<p><code>sysin</code> は <code>{"cmd": string, "service": string}</code> 形式のオブジェクトです。次の Go コードのロジックを再現してください。</p>
<ul>
<li>まず <code>cmd</code> 文字列に <code>"--abort-on-container-exit"</code> または <code>"--exit-code-from"</code> が <code>strings.Contains</code> で含まれているか判定し、どちらか一方でも含まれていれば、そのまま <code>cmd</code> を出力します。</li>
<li>含まれていなければ、<code>parts := strings.Fields(cmd)</code> で分割し、<code>parts</code> の中から最初の <code>"up"</code> を探します。</li>
<li><code>"up"</code> が見つかった場合、その直後に新しい引数を挿入します。新しい引数は、<code>["--abort-on-container-exit"]</code> に加え、<code>service</code> が空文字でなければ <code>"--exit-code-from"</code> と <code>service</code> を続けたものとします。</li>
<li>挿入後の配列をスペースで <code>strings.Join</code> した文字列を結果として出力します。</li>
<li><code>"up"</code> が 1 度も現れない場合は、元の <code>cmd</code> をそのまま出力します。</li>
</ul>
<p>入力: stdin の JSON を読み込んで <code>sysin</code>（object）とする。</p>
<p>処理: 上記の条件分岐、<code>strings.Contains</code>、<code>strings.Fields</code>、スライスへの挿入、および <code>strings.Join</code> を模したロジックで最終的なコマンド文字列を生成し、出力する。</p>

## sysinFormat
`{"cmd": string, "service": string}`

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
	var sysin map[string]interface{}
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	cmd := sysin["cmd"].(string)
	service := sysin["service"].(string)

	if strings.Contains(cmd, "--abort-on-container-exit") || strings.Contains(cmd, "--exit-code-from") {
		out, err := json.Marshal(cmd)
		if err != nil {
			panic(err)
		}
		fmt.Println(string(out))
		return
	}

	args := []string{"--abort-on-container-exit"}
	if service != "" {
		args = append(args, "--exit-code-from", service)
	}

	parts := strings.Fields(cmd)
	inserted := false
	newParts := []string{}

	for i, p := range parts {
		newParts = append(newParts, p)
		if !inserted && p == "up" {
			newParts = append(newParts, args...)
			inserted = true
		}
		_ = i
	}

	if !inserted {
		out, err := json.Marshal(cmd)
		if err != nil {
			panic(err)
		}
		fmt.Println(string(out))
		return
	}

	result := strings.Join(newParts, " ")

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": {"cmd": "docker compose up web", "service": "web"}, "expected": "docker compose up --abort-on-container-exit --exit-code-from web web"}`
### testcase2
`{"sysin": {"cmd": "docker compose up --abort-on-container-exit web", "service": "web"}, "expected": "docker compose up --abort-on-container-exit web"}`
### testcase3
`{"sysin": {"cmd": "docker compose ps", "service": "web"}, "expected": "docker compose ps"}`

# 1問目
## title
for文とタプルのアンパック代入

## statement
<p><code>sysin</code> は <code>[[beat, bpm], [beat, bpm], ...]</code> という形式の2要素配列の配列です。次の Python コードの <code>for</code> 文部分の処理を、同じロジックになるように実装してください。</p>
<pre><code>beat_last = -1.0
bpms = []
for beat, bpm in beat_bpm:
    assert beat &gt;= beat_last
    if beat == beat_last:
        bpms[-1] = (beat, bpm)
    else:
        bpms.append((beat, bpm))
    beat_last = beat
</code></pre>
<p>ここで <code>beat_bpm</code> は <code>sysin</code> を指すものとします。処理結果として、最終的な <code>bpms</code> の値を <code>result</code> に代入し、JSON として出力してください。</p>

## sysinFormat
`[[number, number], [number, number], ...]`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beat_bpm = sysin

beat_last = -1.0
bpms = []
for beat, bpm in beat_bpm:
    assert beat >= beat_last
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
`{"sysin": [[0.0, 120.0], [0.0, 150.0], [1.0, 180.0]], "expected": [[0.0, 150.0], [1.0, 180.0]]}`
### testcase3
`{"sysin": [], "expected": []}`

# 2問目
## title
辞書への集約とfilter関数の条件付きフィルタリング

## statement
<p><code>sysin</code> は <code>[[beat, stop], [beat, stop], ...]</code> という形式の2要素配列の配列です。次の Python コードと同じロジックを実装してください（ただし <code>filter</code> はリスト内包表記で置き換えて構いません）。</p>
<pre><code>stops = {}
for beat, stop in beat_stop:
    assert beat &gt; 0.0
    if beat in stops:
        stops[beat] += stop
    stops[beat] = stop
beat_stop = filter(lambda x: x[1] != 0.0, sorted(stops.items(), key=lambda x: x[0]))
</code></pre>
<p>ここで <code>beat_stop</code> は <code>sysin</code> を指すものとします。<code>sorted(stops.items(), key=lambda x: x[0])</code> で得られた並びを使い、<code>x[1] != 0.0</code> でフィルタした後の配列（<code>[[beat, stop], ...]</code> の形）を <code>result</code> に代入し、JSON として出力してください。</p>

## sysinFormat
`[[number, number], [number, number], ...]`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

beat_stop = sysin

stops = {}
for beat, stop in beat_stop:
    assert beat > 0.0
    if beat in stops:
        stops[beat] += stop
    stops[beat] = stop

items = list(stops.items())
items_sorted = sorted(items, key=lambda x: x[0])
beat_stop_filtered = [[beat, stop] for beat, stop in items_sorted if stop != 0.0]

result = beat_stop_filtered

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": [[16.0, 5.0]], "expected": [[16.0, 5.0]]}`
### testcase2
`{"sysin": [[4.0, 1.0], [4.0, -1.0], [8.0, 2.0]], "expected": [[8.0, 2.0]]}`
### testcase3
`{"sysin": [[1.0, 0.0], [2.0, 3.0], [2.0, -3.0], [3.0, 1.5]], "expected": [[3.0, 1.5]]}`

# 3問目
## title
for文での累積計算とリストへのappend

## statement
<p><code>sysin</code> は <code>{"offset": number, "beat_bps": [[beat, bps], ...]}</code> という形式のオブジェクトです。次の Python コードと同じロジックを実装してください。</p>
<pre><code>time_cum = -offset
beat_last, bps_last = beat_bps[0]
times = [-offset]
for beat, bps in beat_bps[1:]:
    dbeat = beat - beat_last
    dtime = dbeat / bps_last
    time_cum += dtime
    times.append(time_cum)
    beat_last = beat
    bps_last = bps
</code></pre>
<p>ここで <code>offset</code> と <code>beat_bps</code> はそれぞれ <code>sysin["offset"]</code>, <code>sysin["beat_bps"]</code> を指すものとします。最終的な <code>times</code> のリストを <code>result</code> に代入し、JSON として出力してください。</p>

## sysinFormat
`{"offset": number, "beat_bps": [[number, number], [number, number], ...]}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

offset = sysin["offset"]
beat_bps = sysin["beat_bps"]

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

result = times

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"offset": 0.05, "beat_bps": [[0.0, 2.0], [32.0, 1.0], [64.0, 2.0]]}, "expected": [-0.05, 15.95, 47.95]}`
### testcase2
`{"sysin": {"offset": 0.0, "beat_bps": [[0.0, 1.0]]}, "expected": [0.0]}`
### testcase3
`{"sysin": {"offset": 1.0, "beat_bps": [[0.0, 0.5], [4.0, 1.0]]}, "expected": [-1.0, 7.0]}`