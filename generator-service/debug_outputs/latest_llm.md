# 1問目

## title
JSON入力の数値をそのまま出力

## content_markdown
変数 `sysin` には JSON オブジェクト `{"n": number}` が入ります。`sysin["n"]` を JSON として1行で標準出力してください。

## sysinFormat
`{"n": number}`

## sampleCode
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
