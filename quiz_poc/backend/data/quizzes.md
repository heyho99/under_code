```python:1
title = "文字列からパスパラメータ名の集合を取得する"
description = """
対象コードの `get_path_param_names` 関数にある

    return set(re.findall("{(.*?)}", path))

の処理を参考にします。

変数 `sysin` にはパス文字列が代入されます。
このパス文字列の中から、`{...}` で囲まれている部分をすべて正規表現で抽出し、
それらを要素とする `set` を作成して、標準出力してください。

ヒント:
- `import re` を行ってください
- `re.findall` を使って `{}` の中身をすべて取り出してください
- 結果は `set` 型のまま `print` して構いません
"""
sysin_format = '"/items/{item_id}/users/{user_id}" のようなパス文字列'

sample_code = """
import re

path = sysin
names = set(re.findall(r"{(.*?)}", path))
print(names)
"""

test_case_1 = {
    "sysin": "/items/{item_id}/users/{user_id}",
    "expected": {"item_id", "user_id"},
}
test_case_2 = {
    "sysin": "/no/params/here",
    "expected": set(),
}
test_case_3 = {
    "sysin": "/{one}/{two}/{one}",
    "expected": {"one", "two"},
}
```

```python:2
title = "HTTPステータスコードでレスポンスボディが許可されるか判定する"
description = """
対象コードの `is_body_allowed_for_status_code` 関数の先頭付近にある

    if status_code is None:
        return True

および

    if status_code in {
        "default",
        "1XX",
        "2XX",
        "3XX",
        "4XX",
        "5XX",
    }:
        return True

さらに

    current_status_code = int(status_code)
    return not (current_status_code < 200 or current_status_code in {204, 205, 304})

という処理を参考にします。

変数 `sysin` には、`int`, `str`, もしくは `None` が代入されます。
この値を HTTP ステータスコードとして解釈し、
レスポンスボディが「許可される場合」は `True`、「許可されない場合」は `False` を標準出力してください。

条件:
- `sysin` が `None` のときは `True`
- `sysin` が `"default"`, `"1XX"`, `"2XX"`, `"3XX"`, `"4XX"`, `"5XX"` のいずれかの文字列のときは `True`
- それ以外は `int(sysin)` で整数に変換し、
  - 200 未満、または `204`, `205`, `304` のときは `False`
  - それ以外は `True`
"""
sysin_format = "None または HTTPステータスコード (int もしくは str)"

sample_code = """
status_code = sysin

if status_code is None:
    print(True)
elif status_code in {"default", "1XX", "2XX", "3XX", "4XX", "5XX"}:
    print(True)
else:
    current_status_code = int(status_code)
    result = not (current_status_code < 200 or current_status_code in {204, 205, 304})
    print(result)
"""

test_case_1 = {
    "sysin": 200,
    "expected": True,
}
test_case_2 = {
    "sysin": 204,
    "expected": False,
}
test_case_3 = {
    "sysin": "1XX",
    "expected": True,
}
```

```python:3
title = "正規表現で操作IDを生成する"
description = """
対象コードの `generate_operation_id_for_path` 関数内にある

    operation_id = f"{name}{path}"
    operation_id = re.sub(r"\\W", "_", operation_id)
    operation_id = f"{operation_id}_{method.lower()}"

という処理を参考にします。

変数 `sysin` には、`(name, path, method)` の3要素からなるタプルが代入されます。
この3つの値を用いて、次の手順で文字列 `operation_id` を生成し、標準出力してください。

1. `name` と `path` を連結して 1 つの文字列にする
2. その文字列中の「英数字とアンダースコア以外」の文字を、正規表現 `re.sub(r"\\W", "_", ...)` を使って `_` に置き換える
3. 末尾に `_` と `method` を小文字にした文字列を連結する

ヒント:
- `import re` を行ってください
- タプルの要素は `name, path, method = sysin` のように取り出せます
"""
sysin_format = '("関数名", "/path/{param}", "HTTPメソッド") の3要素タプル'

sample_code = """
import re

name, path, method = sysin
operation_id = f"{name}{path}"
operation_id = re.sub(r"\\W", "_", operation_id)
operation_id = f"{operation_id}_{method.lower()}"
print(operation_id)
"""

test_case_1 = {
    "sysin": ("read_item", "/items/{item_id}", "GET"),
    "expected": "read_item_items__item_id__get",
}
test_case_2 = {
    "sysin": ("create-user", "/users/", "POST"),
    "expected": "create_user_users__post",
}
test_case_3 = {
    "sysin": ("op", "/a/b?x=1", "DELETE"),
    "expected": "op_a_b_x_1_delete",
}
```

```python:4
title = "二つの辞書を再帰的にマージする（deep_dict_update の条件分岐）"
description = """
対象コードの `deep_dict_update` 関数にある次の部分を参考にします。

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

変数 `sysin` には `(main_dict, update_dict)` の2要素タプルが代入されます。
この2つの辞書を上記ロジックどおりにマージした結果の `main_dict` を標準出力してください。

仕様:
- 同じキーに対して両方とも値が辞書であれば、再帰的にマージする
- 同じキーに対して両方とも値がリストであれば、`main_dict[key] + update_dict[key]` で連結する
- それ以外の場合は、`update_dict` 側の値で上書きする

ヒント:
- 実装は関数にしてもしなくても構いません
- もとの `main_dict` を直接更新して構いません
"""
sysin_format = "({ ... } , { ... }) の2つの辞書からなるタプル"

sample_code = """
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

main_dict, update_dict = sysin
deep_dict_update(main_dict, update_dict)
print(main_dict)
"""

test_case_1 = {
    "sysin": (
        {"a": 1, "b": {"x": 1}},
        {"b": {"y": 2}, "c": 3},
    ),
    "expected": {"a": 1, "b": {"x": 1, "y": 2}, "c": 3},
}
test_case_2 = {
    "sysin": (
        {"lst": [1, 2], "v": 10},
        {"lst": [3], "v": 20},
    ),
    "expected": {"lst": [1, 2, 3], "v": 20},
}
test_case_3 = {
    "sysin": (
        {"d": {"k": [1]}},
        {"d": {"k": [2]}, "e": {}},
    ),
    "expected": {"d": {"k": [1, 2]}, "e": {}},
}
```

```python:5
title = "優先順位付きでデフォルト値を選ぶ"
description = """
対象コードの `get_value_or_default` 関数にある

    items = (first_item,) + extra_items
    for item in items:
        if not isinstance(item, DefaultPlaceholder):
            return item
    return first_item

のロジックを、より単純な型で再現します。

ここでは `DefaultPlaceholder` の代わりに、文字列 `"DEFAULT"` を使います。
変数 `sysin` には、1個以上の要素を持つタプルが代入され、
各要素は任意の値か文字列 `"DEFAULT"` です。

仕様:
- 左から順に要素を見ていき、最初に `"DEFAULT"` ではない要素があれば、それを選ぶ
- すべて `"DEFAULT"` の場合は、最初の要素（=`"DEFAULT"`）を選ぶ
- 選ばれた値を標準出力してください

ヒント:
- タプルをそのまま `for` でループできます
- `all(...)` を使う必要はありません
"""
sysin_format = '("DEFAULT", "DEFAULT", 3) のような複数要素タプル'

sample_code = """
items = sysin

chosen = None
for item in items:
    if item != "DEFAULT":
        chosen = item
        break

if chosen is None:
    chosen = items[0]

print(chosen)
"""

test_case_1 = {
    "sysin": ("DEFAULT", "DEFAULT", 3),
    "expected": 3,
}
test_case_2 = {
    "sysin": ("DEFAULT", "x", "y"),
    "expected": "x",
}
test_case_3 = {
    "sysin": ("DEFAULT", "DEFAULT"),
    "expected": "DEFAULT",
}
```