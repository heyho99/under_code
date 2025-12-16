# 1問目
## title
正規表現を使ってパスパラメータ名を取得する関数の作成

## content_markdown
次の `get_path_param_names` 関数は、URL パス文字列から `{}` で囲まれたパラメータ名をすべて取り出し、集合として返します。

```python
def get_path_param_names(path: str) -> Set[str]:
    return set(re.findall("{(.*?)}", path))
```

この関数と同様の挙動をする `extract_param_names` 関数を作成してください。

- 引数: `path: str`
- 返り値: `List[str]`
    - パラメータ名のリスト
    - 集合ではなくリストを返すこと（順序は問わない）
- 正規表現 `re.findall("{(.*?)}", path)` を用いて実装すること

`sysin` は次の形式の JSON で与えられます:

```json
{
  "path": "/users/{user_id}/items/{item_id}"
}
```

このとき、あなたのプログラムは `["user_id", "item_id"]`（順不同可）を JSON 形式で出力してください。

## sysinFormat
{"path": "文字列のURLパス"}

## sampleCode
```python
import sys
import json
import re
from typing import List

def extract_param_names(path: str) -> List[str]:
    # ここを実装
    return re.findall(r"{(.*?)}", path)

def main():
    data = json.load(sys.stdin)
    path = data["path"]
    result = extract_param_names(path)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

## testcases
### testcase1
{"sysin": {"path": "/users/{user_id}/items/{item_id}"}, "expected": ["user_id", "item_id"]}
### testcase2
{"sysin": {"path": "/no/params/here"}, "expected": []}
### testcase3
{"sysin": {"path": "/{a}/{b}/{a}"}, "expected": ["a", "b", "a"]}

---

# 2問目
## title
ステータスコードに応じてレスポンスボディ可否を判定する

## content_markdown
`is_body_allowed_for_status_code` 関数は、ステータスコードに応じてレスポンスボディを含めてよいかどうかを判定します。

```python
def is_body_allowed_for_status_code(status_code: Union[int, str, None]) -> bool:
    if status_code is None:
        return True
    if status_code in {"default", "1XX", "2XX", "3XX", "4XX", "5XX"}:
        return True
    current_status_code = int(status_code)
    return not (current_status_code < 200 or current_status_code in {204, 205, 304})
```

この関数と同じロジックを持つ `allow_body` 関数を作成してください。

仕様:
- 引数: `code` は `int` または `str` または `None`
- 振る舞い:
  - `None` → `True`
  - `"default"`, `"1XX"`, `"2XX"`, `"3XX"`, `"4XX"`, `"5XX"` → `True`
  - それ以外は `int(code)` に変換し、`< 200` または `204, 205, 304` のいずれかなら `False`、それ以外は `True`

`sysin` は次の形式です:

```json
{
  "code": 204
}
```

## sysinFormat
{"code": (数値または文字列またはnull)}

## sampleCode
```python
import sys
import json
from typing import Union

def allow_body(code: Union[int, str, None]) -> bool:
    if code is None:
        return True
    if code in {"default", "1XX", "2XX", "3XX", "4XX", "5XX"}:
        return True
    current = int(code)
    return not (current < 200 or current in {204, 205, 304})

def main():
    data = json.load(sys.stdin)
    code = data.get("code", None)
    result = allow_body(code)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

## testcases
### testcase1
{"sysin": {"code": null}, "expected": true}
### testcase2
{"sysin": {"code": "2XX"}, "expected": true}
### testcase3
{"sysin": {"code": 199}, "expected": false}
### testcase4
{"sysin": {"code": 204}, "expected": false}
### testcase5
{"sysin": {"code": 200}, "expected": true}

---

# 3問目
## title
再帰的な辞書マージ処理の実装

## content_markdown
`deep_dict_update` 関数は、2つの辞書を「深く」マージします。

```python
def deep_dict_update(main_dict: Dict[Any, Any], update_dict: Dict[Any, Any]) -> None:
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
```

これと同じ仕様を持つ `merge_deep` 関数を作成し、その結果の辞書を返してください。

仕様:
- 引数:
  - `base: dict`
  - `override: dict`
- 処理:
  - `override` の各キーについて、上記コードと同じロジックで `base` を更新
  - 関数は更新された `base` を返す

`sysin` は次の形式です:

```json
{
  "base": {...},
  "override": {...}
}
```

## sysinFormat
{"base": オブジェクト, "override": オブジェクト}

## sampleCode
```python
import sys
import json
from typing import Any, Dict

def merge_deep(base: Dict[Any, Any], override: Dict[Any, Any]) -> Dict[Any, Any]:
    for key, value in override.items():
        if (
            key in base
            and isinstance(base[key], dict)
            and isinstance(value, dict)
        ):
            merge_deep(base[key], value)
        elif (
            key in base
            and isinstance(base[key], list)
            and isinstance(override[key], list)
        ):
            base[key] = base[key] + override[key]
        else:
            base[key] = value
    return base

def main():
    data = json.load(sys.stdin)
    base = data["base"]
    override = data["override"]
    result = merge_deep(base, override)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

## testcases
### testcase1
{"sysin": {"base": {"a": 1}, "override": {"b": 2}}, "expected": {"a": 1, "b": 2}}
### testcase2
{"sysin": {"base": {"a": {"x": 1}}, "override": {"a": {"y": 2}}}, "expected": {"a": {"x": 1, "y": 2}}}
### testcase3
{"sysin": {"base": {"a": [1, 2]}, "override": {"a": [3]}}, "expected": {"a": [1, 2, 3]}}
### testcase4
{"sysin": {"base": {"a": {"b": [1]}}, "override": {"a": {"b": [2, 3]}}}, "expected": {"a": {"b": [1, 2, 3]}}}

---

# 4問目
## title
可変長引数と型チェックを用いたデフォルト値選択関数

## content_markdown
`get_value_or_default` 関数は、`DefaultPlaceholder` インスタンスをスキップしつつ、最初に「実際の値」を返す関数です。

```python
def get_value_or_default(
    first_item: Union[DefaultPlaceholder, DefaultType],
    *extra_items: Union[DefaultPlaceholder, DefaultType],
) -> Union[DefaultPlaceholder, DefaultType]:
    items = (first_item,) + extra_items
    for item in items:
        if not isinstance(item, DefaultPlaceholder):
            return item
    return first_item
```

このロジックと同じ動きをする `pick_first_non_default` 関数を作り、`DefaultPlaceholder` の代わりに単純なクラス `MyDefault` を使ってください。

仕様:
- クラス `MyDefault` を定義
- 関数シグネチャ:

```python
from typing import Any

def pick_first_non_default(first_item: Any, *extra_items: Any) -> Any:
    ...
```

- `MyDefault` のインスタンスを「デフォルト」とみなし、それ以外の最初の値を返す
- 全てが `MyDefault` だった場合は `first_item` を返す

`sysin` の形式:

```json
{
  "items": [ 値の配列 ]
}
```

配列中の `"__DEFAULT__"` は `MyDefault()` に読み替えてください。

## sysinFormat
{"items": 配列}

## sampleCode
```python
import sys
import json
from typing import Any, List

class MyDefault:
    pass

def pick_first_non_default(first_item: Any, *extra_items: Any) -> Any:
    items = (first_item,) + extra_items
    for item in items:
        if not isinstance(item, MyDefault):
            return item
    return first_item

def parse_items(raw_items: List[Any]) -> List[Any]:
    parsed = []
    for v in raw_items:
        if v == "__DEFAULT__":
            parsed.append(MyDefault())
        else:
            parsed.append(v)
    return parsed

def main():
    data = json.load(sys.stdin)
    raw_items = data["items"]
    items = parse_items(raw_items)
    if not items:
        result = None
    else:
        result = pick_first_non_default(items[0], *items[1:])
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

## testcases
### testcase1
{"sysin": {"items": ["__DEFAULT__", 10, 20]}, "expected": 10}
### testcase2
{"sysin": {"items": ["__DEFAULT__", "__DEFAULT__", "x"]}, "expected": "x"}
### testcase3
{"sysin": {"items": ["__DEFAULT__", "__DEFAULT__"]}, "expected": null}
### testcase4
{"sysin": {"items": [1, "__DEFAULT__", 2]}, "expected": 1}

---

# 5問目
## title
正規表現と文字列フォーマットを用いた一意なID生成

## content_markdown
`generate_unique_id` 関数は、`route` オブジェクトから一意な ID を生成します。

```python
def generate_unique_id(route: "APIRoute") -> str:
    operation_id = f"{route.name}{route.path_format}"
    operation_id = re.sub(r"\W", "_", operation_id)
    assert route.methods
    operation_id = f"{operation_id}_{list(route.methods)[0].lower()}"
    return operation_id
```

このロジックを模倣し、単純な辞書から ID を生成する `make_unique_id` 関数を作成してください。

仕様:
- 引数 `route_info: dict` は次のキーを持つ:
  - `"name"`: 文字列
  - `"path_format"`: 文字列
  - `"methods"`: 文字列の配列（空でない）
- ロジック:
  1. `operation_id = name + path_format`
  2. `re.sub(r"\W", "_", operation_id)` で英数字以外を `_` に置換
  3. `methods` の最初の要素を小文字にして末尾に `"_" + それ` を付ける

`sysin` は `route_info` 自体を渡します。

## sysinFormat
{"name": 文字列, "path_format": 文字列, "methods": [文字列,...]}

## sampleCode
```python
import sys
import json
import re
from typing import Dict, Any

def make_unique_id(route_info: Dict[str, Any]) -> str:
    operation_id = f"{route_info['name']}{route_info['path_format']}"
    operation_id = re.sub(r"\W", "_", operation_id)
    methods = route_info["methods"]
    assert methods
    operation_id = f"{operation_id}_{methods[0].lower()}"
    return operation_id

def main():
    data = json.load(sys.stdin)
    result = make_unique_id(data)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

## testcases
### testcase1
{"sysin": {"name": "getUser", "path_format": "/users/{user_id}", "methods": ["GET"]}, "expected": "getUser_users__user_id__get"}
### testcase2
{"sysin": {"name": "create-item", "path_format": "/items", "methods": ["POST"]}, "expected": "create_item_items_post"}
### testcase3
{"sysin": {"name": "日本語", "path_format": "/パス", "methods": ["GET"]}, "expected": "____get"}

---

# 6問目
## title
条件分岐と例外処理を用いた文字列から整数への安全な変換

## content_markdown
`is_body_allowed_for_status_code` 関数では、`status_code` を `int(status_code)` で整数に変換していますが、変換に失敗した場合の処理は考慮されていません。

ここでは、次の仕様を持つ `safe_int_status` 関数を作成してください。

仕様:
- 引数: `code` は `int` または `str` または `None`
- 返り値: `int` または `null`（Pythonでは `None` を返し、JSON では `null`）
- ロジック:
  1. `code is None` → `None` を返す
  2. `code` が `int` → そのまま返す
  3. `code` が `str` → `int(code)` を試みる
      - 成功したら、その整数を返す
      - `ValueError` が発生したら `None` を返す

`sysin` は次の形式です:

```json
{
  "code": "200"
}
```

## sysinFormat
{"code": 数値または文字列またはnull}

## sampleCode
```python
import sys
import json
from typing import Union, Optional

def safe_int_status(code: Union[int, str, None]) -> Optional[int]:
    if code is None:
        return None
    if isinstance(code, int):
        return code
    # ここで code は str の想定
    try:
        return int(code)
    except ValueError:
        return None

def main():
    data = json.load(sys.stdin)
    code = data.get("code", None)
    result = safe_int_status(code)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

## testcases
### testcase1
{"sysin": {"code": 404}, "expected": 404}
### testcase2
{"sysin": {"code": "201"}, "expected": 201}
### testcase3
{"sysin": {"code": "not_a_number"}, "expected": null}
### testcase4
{"sysin": {"code": null}, "expected": null}