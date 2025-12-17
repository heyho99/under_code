# 1問目
## title
正規表現でパスパラメータ名を抽出する

## content_markdown
入力: `sysin` は文字列です（URLパスを表します）。

処理: `re.findall("{(.*?)}", path)` と `set(...)` を用いた次のロジックを再現してください。

1. 文字列 `sysin` をパスとみなし、`{id}` のような波かっこで囲まれた部分をすべて正規表現で抽出する（中身の文字列だけを取り出す）。
2. 抽出したすべての名前を集合（重複なし）にして `result` として JSON で出力する。

## sysinFormat
`string`

## sampleAnswer
```python
import sys
import json
import re

sysin = json.loads(sys.stdin.read() or "null")

path = sysin
names = set(re.findall("{(.*?)}", path))
result = list(names)

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": "/items/{item_id}", "expected": ["item_id"]}`
### testcase2
`{"sysin": "/users/{user_id}/orders/{order_id}", "expected": ["user_id", "order_id"]}`
### testcase3
`{"sysin": "/status", "expected": []}`

# 2問目
## title
HTTPステータスコードからレスポンスボディ許可可否を判定する

## content_markdown
入力: `sysin` は数値・文字列・null のいずれかです（HTTPステータスコード、または特殊文字列）。

処理: `is_body_allowed_for_status_code` 関数と同じロジックを実装し、その真偽値を `result` として出力してください。

ルール:

1. `sysin is None`（JSONのnull）のとき: `true` を返す。
2. `sysin` が `"default"`, `"1XX"`, `"2XX"`, `"3XX"`, `"4XX"`, `"5XX"` のいずれかの文字列のとき: `true` を返す。
3. 上記以外のとき:
   - `int(sysin)` で整数に変換し `current_status_code` とする（数値ならそのまま、文字列なら数値文字列を想定）。
   - `(current_status_code < 200) または (current_status_code が 204, 205, 304 のいずれか)` のとき `false`。
   - それ以外は `true`。

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
`{"sysin": "2XX", "expected": true}`
### testcase3
`{"sysin": 204, "expected": false}`
### testcase4
`{"sysin": "304", "expected": false}`
### testcase5
`{"sysin": 404, "expected": true}`

# 3問目
## title
2つの辞書を深くマージする（再帰 + 型判定）

## content_markdown
入力: `sysin` は `{"main": {...}, "update": {...}}` という2つの辞書を含むオブジェクトです。

処理: `deep_dict_update` 関数と同じロジックで `main` を更新し、その更新後の `main` を `result` として出力してください。

具体的なルール:

- `update` の各 `(key, value)` について処理する。
- 次の条件をすべて満たす場合:
  - `key` が `main` に存在し、
  - `main[key]` が辞書（`dict`）であり、
  - `value` も辞書である  
  → 再帰的に `deep_dict_update(main[key], value)` を行う。
- 上記でなく、次の条件をすべて満たす場合:
  - `key` が `main` に存在し、
  - `main[key]` がリスト（`list`）であり、
  - `update[key]` もリストである  
  → `main[key] = main[key] + update[key]` としてリストを結合する。
- それ以外の場合は:
  - `main[key] = value` として上書きする。

## sysinFormat
`{"main": object, "update": object}`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

main_dict = sysin["main"]
update_dict = sysin["update"]

def deep_dict_update(main_dict, update_dict):
    for key, value in update_dict.items():
        if (
            key in main_dict
            and isinstance(main_dict[key], dict)
            and isinstance(value, dict)
        ):
            deep_dict_update(main_dict[key], value)
        elif (
            key in main_dict
            and isinstance(main_dict[key], list)
            and isinstance(update_dict[key], list)
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
`{"sysin": {"main": {"a": 1}, "update": {"b": 2}}, "expected": {"a": 1, "b": 2}}`
### testcase2
`{"sysin": {"main": {"a": {"x": 1}}, "update": {"a": {"y": 2}}}, "expected": {"a": {"x": 1, "y": 2}}}`
### testcase3
`{"sysin": {"main": {"a": [1, 2]}, "update": {"a": [3, 4]}}, "expected": {"a": [1, 2, 3, 4]}}`
### testcase4
`{"sysin": {"main": {"a": [1, 2]}, "update": {"a": 10}}, "expected": {"a": 10}}`