# 1問目
## title
文字列をスペース区切りで分割する

## statement
<p><code>sysin</code> は1つの文字列です。この文字列を、Go の <code>strings.Fields</code> を使うのと同じルールで空白区切りし、結果の文字列スライスを JSON 配列として出力してください。</p>
<p>具体的には、連続する空白文字は1つの区切りとして扱い、先頭や末尾の空白は無視して分割結果には含めません。</p>

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
	var sysin interface{}
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	inputStr := ""
	if sysin != nil {
		inputStr = sysin.(string)
	}

	fields := strings.Fields(inputStr)
	var result interface{} = fields

	out, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(out))
}
```

## testcases
### testcase1
`{"sysin": "docker compose -f docker-compose.yml up", "expected": ["docker","compose","-f","docker-compose.yml","up"]}`
### testcase2
`{"sysin": "  a   b c  ", "expected": ["a","b","c"]}`
### testcase3
`{"sysin": "", "expected": []}`

# 2問目
## title
コマンド引数から <code>-f</code> オプションの値を抽出する

## statement
<p><code>sysin</code> は1つの文字列で、シェルコマンド全体を表します。これを <code>strings.Fields</code> と同じルールで分割したうえで、配列を先頭から走査し、要素が <code>"-f"</code> であり、かつその直後に要素が存在するとき、その「直後の要素」を結果配列に追加してください。</p>
<p>すべての要素を走査し終えたら、集めた文字列の配列を JSON として出力してください。</p>

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
	var sysin interface{}
	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(b, &sysin); err != nil {
		panic(err)
	}

	cmd := ""
	if sysin != nil {
		cmd = sysin.(string)
	}

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
`{"sysin": "docker compose -f a.yml up", "expected": ["a.yml"]}`
### testcase2
`{"sysin": "docker compose -f a.yml -f b.yml run", "expected": ["a.yml","b.yml"]}`
### testcase3
`{"sysin": "docker compose up -f", "expected": []}`