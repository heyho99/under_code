# 1問目
## title
文字列を空白区切りで分割してスライスに格納する

## statement
<p><code>sysin</code> は 1 つの文字列です。<br>
この文字列を <code>strings.Fields</code> と同じルール（空白文字で分割し、連続する空白はまとめて扱う）で分割し、その結果の文字列スライスを JSON 配列として出力してください。</p>
<p>入力: 実行時に変数 <code>sysin</code> が与えられます（stdin の JSON を読み込んで <code>sysin</code> に入れる）。<br>
処理: <code>sysin</code> を Go の <code>string</code> 型として受け取り、<code>strings.Fields</code> 相当の処理を自分で実装して（標準ライブラリは使っても使わなくてもよい）、分割されたトークンの配列を <code>result</code> に格納し、JSON として 1 行出力してください。</p>

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

	parts := strings.Fields(sysin)
	var result interface{} = parts
	if parts == nil {
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
`{"sysin": "docker compose up -d", "expected": ["docker","compose","up","-d"]}`
### testcase2
`{"sysin": "  a   b\tc\n", "expected": ["a","b","c"]}`
### testcase3
`{"sysin": "", "expected": []}`

# 2問目
## title
コマンド引数から -f オプションの値をすべて取り出す

## statement
<p><code>sysin</code> は 1 つのコマンドライン文字列です。<br>
この文字列を空白区切りで分割してトークン列を作り、左から順に走査して、トークン <code>"-f"</code> の直後にあるトークンをすべて配列に集めて出力してください。<br>
<code>"-f"</code> の直後にトークンが存在しない場合は何もしません。同じコマンドの中で <code>"-f"</code> が複数回出てきた場合は、すべての値を順番に配列へ追加します。</p>
<p>入力: 実行時に変数 <code>sysin</code> が与えられます（stdin の JSON を読み込んで <code>sysin</code> に入れる）。<br>
処理: <code>sysin</code> を <code>string</code> として受け取り、<code>strings.Fields</code> 相当でトークン分割し、<code>"-f"</code> の直後のトークンを順に収集したスライスを <code>result</code> に格納して JSON として 1 行出力してください。該当するトークンが 1 つもない場合は空配列を出力してください。</p>

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

	args := strings.Fields(sysin)
	outFiles := []string{}
	for i := 0; i < len(args); i++ {
		if args[i] == "-f" && i+1 < len(args) {
			outFiles = append(outFiles, args[i+1])
		}
	}

	var result interface{} = outFiles
	if outFiles == nil {
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
`{"sysin": "docker compose -f a.yml -f b.yml up", "expected": ["a.yml","b.yml"]}`
### testcase2
`{"sysin": "docker compose up", "expected": []}`
### testcase3
`{"sysin": "cmd -f only", "expected": ["only"]}`

# 3問目
## title
最初に存在するcomposeファイル名を探索するロジックの再現

## statement
<p><code>sysin</code> は、ファイル名と「そのファイルが存在するか」を示す真偽値のマップです。<br>
対象のファイル名候補は、次の 4 つをこの順番でチェックします。</p>
<ul>
<li><code>"docker-compose.yml"</code></li>
<li><code>"docker-compose.yaml"</code></li>
<li><code>"compose.yml"</code></li>
<li><code>"compose.yaml"</code></li>
</ul>
<p>これらのうち、<code>sysin</code> マップ内で値が <code>true</code> になっている最初のキー（順番は上記リストの優先順）を 1 要素だけ含む配列として出力してください。どのファイルも存在しない（いずれも <code>true</code> でない）場合は、空配列を出力してください。</p>
<p>入力: 実行時に変数 <code>sysin</code> が与えられます（stdin の JSON を読み込んで <code>sysin</code> に入れる）。<br>
処理: <code>sysin</code> を <code>map[string]bool</code> として受け取り、上記 4 つのファイル名の中で、<code>sysin[ファイル名]</code> が <code>true</code> である最初のものを 1 つだけ配列に入れて <code>result</code> に格納し、JSON として 1 行出力してください。該当がなければ空配列を出力してください。</p>

## sysinFormat
`{"filename": boolean, ...}`

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
	var sysin map[string]bool
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	candidates := []string{"docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"}
	resultSlice := []string{}
	for _, name := range candidates {
		if ok, exists := sysin[name]; exists && ok {
			resultSlice = append(resultSlice, name)
			break
		}
	}

	var result interface{} = resultSlice
	if resultSlice == nil {
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
`{"sysin": {"docker-compose.yml": true, "compose.yml": true}, "expected": ["docker-compose.yml"]}`
### testcase2
`{"sysin": {"docker-compose.yml": false, "docker-compose.yaml": true}, "expected": ["docker-compose.yaml"]}`
### testcase3
`{"sysin": {"x.yml": true}, "expected": []}`

# 4問目
## title
"up" の直後に特定の引数を挿入する

## statement
<p><code>sysin</code> は <code>{"cmd": string, "service": string}</code> という形式のオブジェクトです。<br>
まず <code>cmd</code> 文字列に、部分文字列 <code>"--abort-on-container-exit"</code> または <code>"--exit-code-from"</code> のどちらかが含まれている場合は、<code>cmd</code> をそのまま出力してください。</p>
<p>どちらも含まれていない場合、<code>cmd</code> を空白で分割したトークン列の中から、最初に現れるトークン <code>"up"</code> を探し、その直後に以下の引数群を順番に挿入した新しいコマンドを作って出力してください。</p>
<ul>
<li>常に <code>"--abort-on-container-exit"</code></li>
<li><code>service</code> が空文字列でない場合は、さらに <code>"--exit-code-from"</code> と <code>service</code> の 2 トークンをこの順で続けて挿入</li>
</ul>
<p><code>"up"</code> トークンが 1 つも見つからない場合は、<code>cmd</code> を変更せずにそのまま出力してください。</p>
<p>入力: 実行時に変数 <code>sysin</code> が与えられます（stdin の JSON を読み込んで <code>sysin</code> に入れる）。<br>
処理: 上記の仕様に従って新しいコマンド文字列を生成し、それを <code>result</code> に格納して JSON として 1 行出力してください。</p>

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
		result, _ := json.Marshal(cmd)
		fmt.Println(string(result))
		return
	}

	args := []string{"--abort-on-container-exit"}
	if service != "" {
		args = append(args, "--exit-code-from", service)
	}

	parts := strings.Fields(cmd)
	inserted := false
	for i, p := range parts {
		if p == "up" {
			newParts := make([]string, 0, len(parts)+len(args))
			newParts = append(newParts, parts[:i+1]...)
			newParts = append(newParts, args...)
			newParts = append(newParts, parts[i+1:]...)
			cmd = strings.Join(newParts, " ")
			inserted = true
			break
		}
	}

	if !inserted {
		// cmd remains unchanged
	}

	var result interface{} = cmd

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": {"cmd": "docker compose up -d", "service": ""}, "expected": "docker compose up --abort-on-container-exit -d"}`
### testcase2
`{"sysin": {"cmd": "docker compose up -d", "service": "api"}, "expected": "docker compose up --abort-on-container-exit --exit-code-from api -d"}`
### testcase3
`{"sysin": {"cmd": "docker compose --abort-on-container-exit up -d", "service": "api"}, "expected": "docker compose --abort-on-container-exit up -d"}`