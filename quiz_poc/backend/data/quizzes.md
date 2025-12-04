Pythonの教育専門家として、提供された `fastapi` 関連のコードから、基本的な文法やデータ処理ロジックを抽出したクイズを5問作成しました。

レベル1（基本文法・処理）に合わせて、関数定義は行わず、与えられた変数 `sysin` を加工して `print` する形式で統一しています。

```python:1
title = "ステータスコードの判定ロジック"
description = """
対象コードの `is_body_allowed_for_status_code` 関数内にある判定ロジックを再現します。
変数 `sysin` にステータスコード（整数または文字列）が代入されます。

以下のルールに従って、Body（レスポンス本文）が許可されるかどうかを判定し、許可される場合は `True`、許可されない場合は `False` を標準出力してください。

1. 値が `None` の場合は `True`。
2. 値が文字列セット `{"default", "1XX", "2XX", "3XX", "4XX", "5XX"}` のいずれかに含まれる場合は `True`。
3. それ以外の場合、値を整数に変換し、以下の条件の**いずれか**に当てはまる場合は `False`（許可されない）、それ以外は `True`。
    * 値が 200 未満
    * 値が `{204, 205, 304}` のセットに含まれる

※ `sysin` は数値変換可能な文字列や整数、あるいは `None` が与えられる前提とします。
"""

sysin_format = "200, '404', '2XX', None など"

sample_code = """
if sysin is None:
    print(True)
elif str(sysin) in {"default", "1XX", "2XX", "3XX", "4XX", "5XX"}:
    print(True)
else:
    code = int(sysin)
    if code < 200 or code in {204, 205, 304}:
        print(False)
    else:
        print(True)
"""

test_case_1 = {"sysin": "2XX", "expected": "True"}
test_case_2 = {"sysin": 204, "expected": "False"}
test_case_3 = {"sysin": 404, "expected": "True"}
```

```python:2
title = "正規表現によるパスパラメータの抽出"
description = """
対象コードの `get_path_param_names` 関数内にある `re.findall` を使用した処理を再現します。
変数 `sysin` に、APIのパスを表す文字列（例: `"/items/{item_id}/detail"`）が代入されます。

正規表現を用いて、波括弧 `{}` で囲まれた部分（パスパラメータ名）をすべて抽出してください。
抽出したパラメータ名は重複を排除し（セット化）、結果の確認のため **アルファベット順にソートしたリスト** として標準出力してください。

ヒント: `import re` が必要です。正規表現パターンは `{(.*?)}` が利用できます。
"""

sysin_format = "\"/users/{user_id}/posts/{post_id}\" （文字列）"

sample_code = """
import re

params = set(re.findall(r"{(.*?)}", sysin))
print(sorted(list(params)))
"""

test_case_1 = {"sysin": "/items/{item_id}", "expected": "['item_id']"}
test_case_2 = {"sysin": "/users/{user_id}/posts/{post_id}", "expected": "['post_id', 'user_id']"}
test_case_3 = {"sysin": "/files/{file_path}/action/{file_path}", "expected": "['file_path']"}
```

```python:3
title = "ID生成のための文字列正規化"
description = """
対象コードの `generate_unique_id` 関数などで使われている `re.sub` による文字列置換処理を再現します。
変数 `sysin` に、操作IDの元となる文字列が代入されます。

以下の処理を行ってください。
1. 文字列内の「英数字以外の文字（非単語文字）」をすべてアンダースコア `_` に置換する。
   （ヒント: 正規表現 `\\W` を使用します）
2. 置換後の文字列をすべて小文字 (`lower()`) に変換する。
3. 結果を標準出力する。

ヒント: `import re` が必要です。
"""

sysin_format = "\"Use:Name-Example\" （文字列）"

sample_code = """
import re

operation_id = re.sub(r"\\W", "_", sysin)
print(operation_id.lower())
"""

test_case_1 = {"sysin": "Get:Items", "expected": "get_items"}
test_case_2 = {"sysin": "User-Create-V1", "expected": "user_create_v1"}
test_case_3 = {"sysin": "Hello World!", "expected": "hello_world_"}
```

```python:4
title = "辞書内のリスト結合による更新"
description = """
対象コードの `deep_dict_update` 関数の一部（リストの結合ロジック）を参考にします。
変数 `sysin` に、`main` と `update` という2つの辞書を含む辞書が代入されます。

`update` 辞書の内容を使って `main` 辞書を更新してください。ただし、更新ルールは以下の通りとします。

1. `update` のキーが `main` に既に存在し、かつ、**両方の値がリスト(list)** である場合：
   `main` のリストの後ろに `update` のリストを結合 (`+`) します。
2. それ以外の場合：
   `main` の値を `update` の値で単純に上書き（または新規追加）します。

処理完了後の `main` 辞書を標準出力してください。
"""

sysin_format = "{\"main\": {...}, \"update\": {...}}"

sample_code = """
main_dict = sysin["main"]
update_dict = sysin["update"]

for key, value in update_dict.items():
    if (
        key in main_dict
        and isinstance(main_dict[key], list)
        and isinstance(value, list)
    ):
        main_dict[key] = main_dict[key] + value
    else:
        main_dict[key] = value

print(main_dict)
"""

test_case_1 = {
    "sysin": {
        "main": {"tags": ["a"], "name": "old"},
        "update": {"tags": ["b"], "name": "new"}
    },
    "expected": "{'tags': ['a', 'b'], 'name': 'new'}"
}
test_case_2 = {
    "sysin": {
        "main": {"scores": [1, 2]},
        "update": {"scores": [3], "extra": "data"}
    },
    "expected": "{'scores': [1, 2, 3], 'extra': 'data'}"
}
test_case_3 = {
    "sysin": {
        "main": {"x": 10},
        "update": {"x": [20]}
    },
    "expected": "{'x': [20]}"
}
```

```python:5
title = "有効な値の優先取得"
description = """
対象コードの `get_value_or_default` 関数を簡略化したロジックを作成します。
変数 `sysin` に、値のリストが代入されます。このリストは優先順位順に並んでいます。

リストの先頭から順に要素を確認し、**`None` ではない最初の値** を見つけて標準出力してください。
もしリストの全ての要素が `None` であれば、`None` を出力してください。

対象コードでは `DefaultPlaceholder` という特別な型で判定していますが、この問題では `None` を「デフォルト（無効な値）」とみなします。
"""

sysin_format = "[None, None, 'Target', 'Ignored'] （リスト）"

sample_code = """
result = None
for item in sysin:
    if item is not None:
        result = item
        break
print(result)

# または対象コードに近い書き方:
# items = sysin
# for item in items:
#     if item is not None:
#         print(item)
#         break
# else:
#     print(items[0] if items else None) 
# ただし単純な探索で十分正解とします。
"""

test_case_1 = {"sysin": [None, "Found", None], "expected": "Found"}
test_case_2 = {"sysin": [None, None, None], "expected": "None"}
test_case_3 = {"sysin": ["First", "Second"], "expected": "First"}
```