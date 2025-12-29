# 1問目

## title
JSON入力の数値をそのまま出力

## statement
標準入力から JSON オブジェクト `{"n": number}` を読み取り、その `n` の値を JSON として1行で標準出力してください。

## sysinFormat
`{"n": number}`

## sampleAnswer
```go
package main

import (
    "encoding/json"
    "os"
)

func main() {
    var sysin map[string]interface{}
    json.NewDecoder(os.Stdin).Decode(&sysin)
    json.NewEncoder(os.Stdout).Encode(sysin["n"])
}
```

## testcases
### testcase1
`{"sysin": {"n": 1}, "expected": 1}`
### testcase2
`{"sysin": {"n": 2}, "expected": 2}`

# 2問目

## title
2つの数値の合計を出力

## statement
標準入力から JSON オブジェクト `{"a": number, "b": number}` を読み取り、`a + b` の結果を JSON として1行で標準出力してください。

## sysinFormat
`{"a": number, "b": number}`

## sampleAnswer
```go
package main

import (
    "encoding/json"
    "os"
)

func main() {
    var sysin map[string]float64
    json.NewDecoder(os.Stdin).Decode(&sysin)
    result := sysin["a"] + sysin["b"]
    json.NewEncoder(os.Stdout).Encode(result)
}
```

## testcases
### testcase1
`{"sysin": {"a": 1, "b": 2}, "expected": 3}`
### testcase2
`{"sysin": {"a": 10, "b": 20}, "expected": 30}`


# 1問目

## title
JSON入力の数値をそのまま出力

## statement
変数 `sysin` には JSON オブジェクト `{"n": number}` が入ります。`sysin["n"]` を JSON として1行で標準出力してください。

## sysinFormat
`{"n": number}`

## sampleAnswer
```python
import sys, json
sysin = json.loads(sys.stdin.read())
print(json.dumps(sysin["n"]))
```

## testcases
### testcase1
`{"sysin": {"n": 1}, "expected": 1}`
### testcase2
`{"sysin": {"n": 2}, "expected": 2}`

# 2問目

## title
2つの数値の合計を出力

## statement
変数 `sysin` には JSON オブジェクト `{"a": number, "b": number}` が入ります。`sysin["a"] + sysin["b"]` の結果を JSON として1行で標準出力してください。

## sysinFormat
`{"a": number, "b": number}`

## sampleAnswer
```python
import sys, json
sysin = json.loads(sys.stdin.read())
result = sysin["a"] + sysin["b"]
print(json.dumps(result))
```

## testcases
### testcase1
`{"sysin": {"a": 1, "b": 2}, "expected": 3}`
### testcase2
`{"sysin": {"a": 10, "b": 20}, "expected": 30}`
