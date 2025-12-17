# 1問目
## title
HTTPステータスコードと条件分岐

## content_markdown
`sysin` は `int` / `string` / `null` のいずれかです。次のルールに従って、`is_body_allowed_for_status_code` 関数と同等の真偽値を計算し、JSONで出力してください。

- 入力: 実行時に `sysin` が与えられます（stdin の JSON を読み込み `sysin` に代入する）。
- 処理:
  - `sysin is None`（JSONでは `null`）なら `true` を返す。
  - 文字列 `"default"`, `"1XX"`, `"2XX"`, `"3XX"`, `"4XX"`, `"5XX"` のいずれかなら `true` を返す。
  - それ以外では `int(sysin)` を `current_status_code` として扱い、
    - `(current_status_code < 200)` または `current_status_code` が `{204, 205, 304}` のいずれかの場合は `false`
    - それ以外は `true`
  - 得られた真偽値を `result` として JSON 1 行で出力する。

## sysinFormat
`number | string | null`

## sampleAnswer
```python
import sys
import json

sysin = json.loads(sys.stdin.read() or "null")

status_code = sysin

if status_code is None:
    result = True
elif status_code in ["default", "1XX", "2XX", "3XX", "4XX", "5XX"]:
    result = True
else:
    current_status_code = int(status_code)
    result = not (current_status_code < 200 or current_status_code in [204, 205, 304])

print(json.dumps(result, ensure_ascii=False))
```

## testcases
### testcase1
`{"sysin": null, "expected": true}`
### testcase2
`{"sysin": "2XX", "expected": true}`
### testcase3
`{"sysin": 204, "expected": false}`

# 2問目
## title
正規表現でパスパラメータ名を抽出する

## content_markdown
`sysin` はパス文字列です。`get_path_param_names` 関数のロジックを再現して、波かっこ `{}` で囲まれたパスパラメータ名をすべて取り出し、重複を除いてリストとして出力してください。

- 入力: 実行時に `sysin` が与えられます（stdin の JSON を読み込み `sysin` に代入する）。
- 処理:
  - `sysin` は文字列のパスとする（例: `"/users/{user_id}/items/{item_id}"`）。
  - 正規表現 `"{(.*?)}"` に相当するマッチを使って、`{` と `}` の間のテキストをすべて抽出する。
  - 集合（重複なし）相当の処理をし、順序は問わないが、Pythonでは一度リストにして `result` とする。
  - `result` を JSON の配列として 1 行で出力する。

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
`{"sysin": "/status", "expected": []}`
### testcase3
`{"sysin": "/{a}/{a}/{b}", "expected": ["a", "b"]}`

# 3問目
## title
ネストした辞書とリストのマージ処理

## content_markdown
`sysin` は `{"main": ..., "update": ...}` という2つの辞書を含むオブジェクトです。`deep_dict_update` 関数のロジックのうち、for ループとその中の条件分岐を再現して、`main` を更新した結果を出力してください。

- 入力: 実行時に `sysin` が与えられます（stdin の JSON を読み込み `sysin` に代入する）。
- 処理:
  - `main_dict = sysin["main"]`, `update_dict = sysin["update"]` として処理する。
  - `for key, value in update_dict.items()` と同等のループを回す。
  - 各 `key` について、次の条件分岐を行い `main_dict` を更新する:
    1. `key` が `main_dict` に存在し、かつ `main_dict[key]` も `value` もどちらも辞書であれば、再帰的に同じ処理（`deep_dict_update(main_dict[key], value)` 相当）を行う。
    2. そうでなく、`key` が `main_dict` に存在し、`main_dict[key]` と `update_dict[key]` がどちらもリストなら、`main_dict[key] = main_dict[key] + update_dict[key]` としてリストを連結する。
    3. 上記のどれにも当てはまらない場合は、`main_dict[key] = value` として上書きする。
  - 最終的な `main_dict` を `result` として JSON で出力する。

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
`{"sysin": {"main": {"a": [1, 2]}, "update": {"a": [3], "b": 10}}, "expected": {"a": [1, 2, 3], "b": 10}}`