# 1問目
## title
コマンド文字列から <code>-f</code> オプションの値を抽出

## statement
<p><code>sysin</code> は文字列で、<code>docker compose</code> コマンド全体が入っています。</p>
<p><code>strings.Fields</code> 相当の処理で空白区切りに分割し、配列を左から順に走査して、要素が <code>"-f"</code> であり、かつ次の要素が存在する場合に、その次の要素（ファイルパス）を結果の配列に追加する処理を実装してください。</p>
<p>最終的に、すべての <code>-f</code> の直後に現れた値だけを配列として JSON 出力してください。1つも見つからなければ空配列を出力します。</p>
<p>入力: 実行時に文字列 <code>sysin</code> が与えられること（stdin の JSON を読み込んで <code>sysin</code> に入れる）。</p>
<p>処理: 上記のロジックを Go で再現し、<code>result</code> に文字列配列として代入してください。</p>

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

	cmdArgs := strings.Fields(sysin)
	var result []string
	for i := 0; i < len(cmdArgs); i++ {
		if cmdArgs[i] == "-f" && i+1 < len(cmdArgs) {
			result = append(result, cmdArgs[i+1])
		}
	}
	if result == nil {
		result = []string{}
	}

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": "docker compose -f a.yml up", "expected": ["a.yml"]}`
### testcase2
`{"sysin": "docker compose up", "expected": []}`
### testcase3
`{"sysin": "docker compose -f a.yml -f b.yaml run", "expected": ["a.yml", "b.yaml"]}`

# 2問目
## title
複数の <code>-f</code> オプション有無による分岐

## statement
<p><code>sysin</code> は文字列で、<code>docker compose</code> コマンド全体が入っています。</p>
<p>コマンドを空白で分割し、1問目と同様に <code>-f</code> の直後の引数をすべて配列に集めてください。1つ以上見つかった場合は、その配列を結果として出力し、1つも見つからなかった場合は空配列を出力してください。</p>
<p>入力: 実行時に文字列 <code>sysin</code> が与えられること。</p>
<p>処理: <code>haveMultipleComposeFiles</code> のようなブール変数を用いて、「<code>-f</code> が1つ以上あるかどうか」を判定し、上記のように結果を分岐させるロジックを Go で再現してください。</p>

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

	cmdArgs := strings.Fields(sysin)
	composePaths := []string{}
	haveMultipleComposeFiles := false

	for i := 0; i < len(cmdArgs); i++ {
		if cmdArgs[i] == "-f" && i+1 < len(cmdArgs) {
			composePaths = append(composePaths, cmdArgs[i+1])
			haveMultipleComposeFiles = true
		}
	}

	var result []string
	if haveMultipleComposeFiles {
		result = composePaths
	} else {
		result = []string{}
	}

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": "docker compose -f a.yml up", "expected": ["a.yml"]}`
### testcase2
`{"sysin": "docker compose up service", "expected": []}`
### testcase3
`{"sysin": "docker compose -f a.yml -f b.yml ps", "expected": ["a.yml", "b.yml"]}`

# 3問目
## title
ファイル一覧から最初に存在するファイル名を返す

## statement
<p><code>sysin</code> は文字列配列で、存在チェックしたいファイル名の候補リストです。</p>
<p>左から順に <code>os.Stat</code> 相当で存在チェックを行い、エラーが「存在しない（<code>os.IsNotExist</code> が true）」でない最初のファイル名だけを要素にもつ配列を結果として出力してください。どのファイルも存在しない場合は空配列を出力します。</p>
<p>入力: 実行時に文字列配列 <code>sysin</code> が与えられること。</p>
<p>処理: Goで <code>for _, filename := range sysin</code> のようにループし、<code>os.Stat</code> と <code>os.IsNotExist</code> を使って上記ロジックを実装し、結果を <code>result</code> に代入してください。</p>

## sysinFormat
`[string, string, ...]`

## sampleAnswer
```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

func main() {
	var sysin []string
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	var result []string
	for _, filename := range sysin {
		if _, err := os.Stat(filename); !os.IsNotExist(err) {
			result = []string{filename}
			break
		}
	}
	if result == nil {
		result = []string{}
	}

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": ["go.mod", "not_exists.txt"], "expected": ["go.mod"]}`
### testcase2
`{"sysin": ["not_exists_1", "not_exists_2"], "expected": []}`
### testcase3
`{"sysin": [], "expected": []}`

# 4問目
## title
文字列に特定のサブ文字列が含まれるか判定

## statement
<p><code>sysin</code> は文字列で、あるコマンド全体が入っています。</p>
<p>この文字列に <code>"--abort-on-container-exit"</code> または <code>"--exit-code-from"</code> のどちらか一方でも含まれていれば <code>true</code>、どちらも含まれていなければ <code>false</code> を出力してください。</p>
<p><code>strings.Contains</code> を2回呼び出し、論理演算子 <code>||</code> を用いた条件分岐を Go で再現してください。</p>
<p>入力: 実行時に文字列 <code>sysin</code> が与えられること。</p>
<p>処理: 上記条件の真偽値を <code>result</code> として JSON 出力してください。</p>

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

	hasAbort := strings.Contains(sysin, "--abort-on-container-exit")
	hasExitCodeFrom := strings.Contains(sysin, "--exit-code-from")
	result := hasAbort || hasExitCodeFrom

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": "docker compose up --abort-on-container-exit", "expected": true}`
### testcase2
`{"sysin": "docker compose up --exit-code-from web", "expected": true}`
### testcase3
`{"sysin": "docker compose up -d", "expected": false}`

# 5問目
## title
文字列配列の特定位置に要素を挿入

## statement
<p><code>sysin</code> は <code>{"parts": [string,...], "args": [string,...], "index": number}</code> という形式のオブジェクトです。</p>
<ul>
<li><code>parts</code>: 既存のコマンドを表す文字列配列</li>
<li><code>args</code>: 挿入したい追加引数の文字列配列</li>
<li><code>index</code>: <code>parts</code> のこのインデックスの直後に <code>args</code> を挿入する（0始まり）</li>
</ul>
<p>Go の <code>make</code> と <code>append</code> を使って、新しいスライス <code>newParts</code> を以下の順に作成してください。</p>
<ol>
<li><code>parts</code> の先頭から <code>index</code> まで（<code>index</code> を含む）</li>
<li><code>args</code> の全要素</li>
<li><code>parts</code> の <code>index+1</code> から末尾まで</li>
</ol>
<p>結果のスライスを JSON 配列として出力してください。</p>
<p>入力: 実行時にオブジェクト <code>sysin</code> が与えられること。</p>
<p>処理: 上記ロジックを Go のスライス操作で再現し、<code>result</code> に文字列配列として代入してください。</p>

## sysinFormat
`{"parts": [string, ...], "args": [string, ...], "index": number}`

## sampleAnswer
```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type Input struct {
	Parts []string  `json:"parts"`
	Args  []string  `json:"args"`
	Index float64   `json:"index"`
}

func main() {
	var sysin Input
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	parts := sysin.Parts
	args := sysin.Args
	i := int(sysin.Index)

	if i < 0 {
		i = 0
	}
	if i >= len(parts) {
		i = len(parts) - 1
	}

	newParts := make([]string, 0, len(parts)+len(args))
	newParts = append(newParts, parts[:i+1]...)
	newParts = append(newParts, args...)
	newParts = append(newParts, parts[i+1:]...)

	result := newParts

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": {"parts": ["docker", "compose", "up"], "args": ["--abort-on-container-exit"], "index": 2}, "expected": ["docker", "compose", "up", "--abort-on-container-exit"]}`
### testcase2
`{"sysin": {"parts": ["docker", "compose", "up"], "args": ["--a", "--b"], "index": 1}, "expected": ["docker", "compose", "--a", "--b", "up"]}`
### testcase3
`{"sysin": {"parts": ["up"], "args": ["--x"], "index": 0}, "expected": ["up", "--x"]}`

# 6問目
## title
コマンド文字列から <code>up</code> の位置を探してフラグを挿入

## statement
<p><code>sysin</code> は <code>{"cmd": string, "service": string}</code> 形式のオブジェクトです。</p>
<ul>
<li><code>cmd</code>: 元の <code>docker compose</code> コマンド（空白区切り）</li>
<li><code>service</code>: サービス名。空文字列なら無視する</li>
</ul>
<p>処理は次の通りです。</p>
<ol>
<li><code>strings.Fields</code> で <code>cmd</code> を分割して <code>parts</code> を得る。</li>
<li><code>args := []string{"--abort-on-container-exit"}</code> を作り、<code>service</code> が空でなければ <code>args</code> に <code>"--exit-code-from"</code>, <code>service</code> を順に <code>append</code> する。</li>
<li><code>parts</code> を先頭から走査し、要素が <code>"up"</code> である最初の位置の直後に <code>args</code> を挿入する（5問目と同様の挿入方法）。</li>
<li><code>up</code> が1つも見つからなければ、元の <code>cmd</code> をそのまま結果とする。</li>
<li>最終的なコマンドを、空白区切りで連結した文字列として出力する。</li>
</ol>
<p>入力: 実行時にオブジェクト <code>sysin</code> が与えられること。</p>
<p>処理: 上記ロジックを Go で実装し、<code>result</code> に文字列として代入してください。</p>

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

type Input struct {
	Cmd     string `json:"cmd"`
	Service string `json:"service"`
}

func main() {
	var sysin Input
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	appCmd := sysin.Cmd
	serviceName := sysin.Service

	args := []string{"--abort-on-container-exit"}
	if serviceName != "" {
		args = append(args, "--exit-code-from", serviceName)
	}

	parts := strings.Fields(appCmd)
	inserted := false
	for i, p := range parts {
		if p == "up" {
			newParts := make([]string, 0, len(parts)+len(args))
			newParts = append(newParts, parts[:i+1]...)
			newParts = append(newParts, args...)
			newParts = append(newParts, parts[i+1:]...)
			parts = newParts
			inserted = true
			break
		}
	}

	var result string
	if inserted {
		result = strings.Join(parts, " ")
	} else {
		result = appCmd
	}

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": {"cmd": "docker compose up", "service": ""}, "expected": "docker compose up --abort-on-container-exit"}`
### testcase2
`{"sysin": {"cmd": "docker compose up web", "service": "web"}, "expected": "docker compose up --abort-on-container-exit --exit-code-from web web"}`
### testcase3
`{"sysin": {"cmd": "docker compose run web", "service": "web"}, "expected": "docker compose run web"}`

# 7問目
## title
環境変数でモックモードを切り替え

## statement
<p><code>sysin</code> は <code>{"env": string}</code> 形式のオブジェクトで、<code>env</code> は環境変数 <code>GENERATOR_MOCK</code> の値を表します。</p>
<p>次のような処理を実装してください。</p>
<ul>
<li><code>env == "1"</code> の場合は、固定の文字列 <code>"MOCK"</code> を結果とする。</li>
<li>それ以外の場合は、固定の文字列 <code>"CALL_LLM"</code> を結果とする。</li>
</ul>
<p>これは <code>if os.Getenv("GENERATOR_MOCK") == "1"</code> という条件分岐と同等です。</p>
<p>入力: 実行時にオブジェクト <code>sysin</code> が与えられること。</p>
<p>処理: 上記ロジックを Go の <code>if</code> 文で再現し、<code>result</code> に文字列として代入してください。</p>

## sysinFormat
`{"env": string}`

## sampleAnswer
```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type Input struct {
	Env string `json:"env"`
}

func main() {
	var sysin Input
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	var result string
	if sysin.Env == "1" {
		result = "MOCK"
	} else {
		result = "CALL_LLM"
	}

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": {"env": "1"}, "expected": "MOCK"}`
### testcase2
`{"sysin": {"env": "0"}, "expected": "CALL_LLM"}`
### testcase3
`{"sysin": {"env": ""}, "expected": "CALL_LLM"}`

# 8問目
## title
リストから最初のキー名を取り出す

## statement
<p><code>sysin</code> は <code>{"files": [object, ...]}</code> 形式のオブジェクトです。</p>
<p>各 <code>file</code> オブジェクトには任意のキーを持つ <code>problemCounts</code> フィールドが含まれていると仮定します（<code>problemCounts</code> が存在しない、または <code>null</code> の場合もあります）。</p>
<p>次のような処理を実装してください。</p>
<ol>
<li><code>files</code> を先頭から順に走査する。</li>
<li>各要素について、<code>problemCounts</code> がオブジェクトであれば、そのキー集合から最初の1つ（Go の <code>for k := range m</code> で得られる最初のキー）を取り出し、その文字列を結果とする。</li>
<li>どの要素でもそのようなキーが見つからなかった場合は、文字列 <code>"syntax"</code> を結果とする。</li>
</ol>
<p>入力: 実行時にオブジェクト <code>sysin</code> が与えられること。</p>
<p>処理: 上記ロジックを Go のマップとスライス、型アサーション（<code>map[string]interface{}</code> など）を用いて再現し、<code>result</code> に文字列として代入してください。</p>

## sysinFormat
`{"files": [object, ...]}`

## sampleAnswer
```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
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

	filesVal, ok := sysin["files"]
	var result string

	if ok {
		if filesSlice, ok := filesVal.([]interface{}); ok {
			found := false
			for _, f := range filesSlice {
				fm, ok := f.(map[string]interface{})
				if !ok {
					continue
				}
				pcVal, ok := fm["problemCounts"]
				if !ok || pcVal == nil {
					continue
				}
				pcMap, ok := pcVal.(map[string]interface{})
				if !ok {
					continue
				}
				for k := range pcMap {
					result = k
					found = true
					break
				}
				if found {
					break
				}
			}
			if !found {
				result = "syntax"
			}
		} else {
			result = "syntax"
		}
	} else {
		result = "syntax"
	}

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": {"files": [{"problemCounts": {"syntax": 2, "io": 1}}]}, "expected": "syntax"}`
### testcase2
`{"sysin": {"files": [{"problemCounts": null}, {"problemCounts": {"advanced": 3}}]}, "expected": "advanced"}`
### testcase3
`{"sysin": {"files": []}, "expected": "syntax"}`