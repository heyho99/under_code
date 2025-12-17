# 1問目
## title
HTTPステータスコードに応じたレスポンスボディ可否判定

## content_markdown
入力: `sysin` は `number|string|null` 型の値です（HTTPステータスコードまたはその文字列表現、もしくは null）  

処理: 次のロジックで、レスポンスボディを許可するかどうかを判定し、その結果を真偽値で出力してください。

- `status_code` が `null` のとき: `true`
- `status_code` が `"default"`, `"1XX"`, `"2XX"`, `"3XX"`, `"4XX"`, `"5XX"` のいずれかのとき: `true`
- それ以外:
  - `status_code` を `int(status_code)` として整数に変換し `current_status_code` とする
  - `(current_status_code < 200)` または `current_status_code` が `{204, 205, 304}` のいずれかのとき: `false`
  - 上記以外のとき: `true`

最終的な判定結果（true/false）を JSON として 1 行で出力してください。

## sysinFormat
`number|string|null`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

status_code = sysin

if status_code is None:
    result = True
elif status_code in {"default", "1XX", "2XX", "3XX", "4XX", "5XX"}:
    result = True
else:
    current_status_code = int(status_code)
    result = not (current_status_code < 200 or current_status_code in {204, 205, 304})

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": null, "expected": true}`
### testcase2
`{"sysin": 204, "expected": false}`
### testcase3
`{"sysin": "201", "expected": true}`

# 2問目
## title
URLパス文字列からパスパラメータ名の集合を取得

## content_markdown
入力: `sysin` は URL パス文字列です。例: `"/users/{user_id}/items/{item_id}"`  

処理: パス文字列の中から、`{...}` で囲まれた部分を正規表現によりすべて抜き出し、その文字列たちの集合を JSON の配列として出力してください。  

仕様:
- 正規表現パターンは `"{(.*?)}"` を使う
- `re.findall` で得られた値を `set(...)` にして重複を除去するイメージで、集合に相当するユニークな値のリストを出力する
- 順序は問わないものとします（採点では集合として扱う）が、実装上は `set` を `list` に変換した結果をそのまま出力すればよい

## sysinFormat
`string`

## sampleAnswer
```python
import sys
import json
import re

sysin = json.loads(sys.stdin.read() or "null")

path = sysin
names = set(re.findall(r"{(.*?)}", path))
result = list(names)

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": "/users/{user_id}/items/{item_id}", "expected": ["user_id", "item_id"]}`
### testcase2
`{"sysin": "/health", "expected": []}`
### testcase3
`{"sysin": "/{a}/{a}/{b}", "expected": ["a", "b"]}`

# 3問目
## title
ネストした辞書・リストをマージする deep_dict_update の再現

## content_markdown
入力: `sysin` は `{"main": {...}, "update": {...}}` という2つの辞書を持つオブジェクトです。  

処理: 次のルールで `main` を破壊的に更新する処理を実装し、更新後の `main` を出力してください（`update` は変更しない）。  

`deep_dict_update(main_dict, update_dict)` の仕様:
- `for key, value in update_dict.items():` を行い、各 `key` を処理する
- もし
  - `key in main_dict` かつ
  - `main_dict[key]` が `dict` インスタンス かつ
  - `value` が `dict` インスタンス  
  ならば、再帰的に `deep_dict_update(main_dict[key], value)` を呼び出す
- `elif` として、もし
  - `key in main_dict` かつ
  - `main_dict[key]` が `list` インスタンス かつ
  - `update_dict[key]` が `list` インスタンス  
  ならば、`main_dict[key] = main_dict[key] + update_dict[key]` としてリスト結合する
- 上記どちらにも当てはまらない場合は `main_dict[key] = value` として上書きする

最終的に更新された `main_dict` を `result` として JSON 出力してください。

## sysinFormat
`{"main": object, "update": object}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

main_dict = sysin.get("main", {})
update_dict = sysin.get("update", {})

def deep_dict_update(main_dict, update_dict):
    for key, value in update_dict.items():
        if (
            key in main_dict
            and isinstance(main_dict.get(key), dict)
            and isinstance(value, dict)
        ):
            deep_dict_update(main_dict[key], value)
        elif (
            key in main_dict
            and isinstance(main_dict.get(key), list)
            and isinstance(update_dict.get(key), list)
        ):
            main_dict[key] = main_dict[key] + update_dict[key]
        else:
            main_dict[key] = value

deep_dict_update(main_dict, update_dict)

result = main_dict

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": {"main": {"a": 1}, "update": {"a": 2}}, "expected": {"a": 2}}`
### testcase2
`{"sysin": {"main": {"a": {"b": 1}}, "update": {"a": {"c": 2}}}, "expected": {"a": {"b": 1, "c": 2}}}`
### testcase3
`{"sysin": {"main": {"x": [1, 2]}, "update": {"x": [3], "y": 10}}, "expected": {"x": [1, 2, 3], "y": 10}}`