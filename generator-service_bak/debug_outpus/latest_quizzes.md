```python:1
title = "整数の最小値制約を満たすか判定して出力する"
description = """
変数 sysin には整数が渡されます。
この値について、「0 以上であればそのまま出力し、0 未満であれば 'invalid' という文字列を出力する」処理を実装してください。

これは、対象コード中の `Field(ge=0)` による「0 以上であること」という制約の考え方を、
シンプルな if 文による判定ロジックで再現する問題です。
"""
sysin_format = "整数（int）"

sample_code = """
value = sysin

if value >= 0:
    print(value)
else:
    print("invalid")
"""

test_case_1 = {"sysin": 10, "expected": 10}
test_case_2 = {"sysin": 0, "expected": 0}
test_case_3 = {"sysin": -5, "expected": "invalid"}
```

```python:2
title = "カテゴリ文字列が許可されたパターンに一致するか判定する"
description = """
変数 sysin には文字列が渡されます。
この文字列が 'study', 'creation', 'other' のいずれかであれば、その文字列をそのまま出力してください。
どれにも当てはまらない場合は、'invalid' という文字列を出力してください。

これは、対象コード中の
pattern=r"^(study|creation|other)$"
という正規表現パターンによる制約を、if 文による単純な一致判定で再現する問題です。
"""
sysin_format = "文字列（str）"

sample_code = """
value = sysin

allowed = ["study", "creation", "other"]

if value in allowed:
    print(value)
else:
    print("invalid")
"""

test_case_1 = {"sysin": "study", "expected": "study"}
test_case_2 = {"sysin": "creation", "expected": "creation"}
test_case_3 = {"sysin": "game", "expected": "invalid"}
```

```python:3
title = "空文字ならデフォルト値に置き換えて出力する"
description = """
変数 sysin には文字列が渡されます。
この文字列が空文字（""）であれば、代わりにデフォルト値として空文字のままではなく 'default' という文字列を出力してください。
空文字でない場合は、元の文字列をそのまま出力してください。

これは、対象コード中の `Field(default=\"\")` など、
値が指定されないときにデフォルト値を用いるという考え方を、
単純な条件分岐で再現する問題です。
"""
sysin_format = "文字列（str）"

sample_code = """
value = sysin

if value == "":
    result = "default"
else:
    result = value

print(result)
"""

test_case_1 = {"sysin": "", "expected": "default"}
test_case_2 = {"sysin": "hello", "expected": "hello"}
test_case_3 = {"sysin": "task_content", "expected": "task_content"}
```

```python:4
title = "None のときだけデフォルト文字列を使う"
description = """
変数 sysin には、文字列または None が渡されます。
sysin が None の場合は 'no_comment' という文字列を出力してください。
sysin が None 以外（任意の文字列）の場合は、その文字列をそのまま出力してください。

これは、対象コード中の `Optional[str] = None` のように、
「値が指定されない（None）ときに特別な扱いをする」というパターンを
if 文で再現する問題です。
"""
sysin_format = "文字列（str）または None"

sample_code = """
value = sysin

if value is None:
    print("no_comment")
else:
    print(value)
"""

test_case_1 = {"sysin": None, "expected": "no_comment"}
test_case_2 = {"sysin": "OK", "expected": "OK"}
test_case_3 = {"sysin": "", "expected": ""}
```

```python:5
title = "ステータス文字列が指定された候補に含まれるか判定する"
description = """
変数 sysin には文字列が渡されます。
この文字列が 'active', 'completed', 'paused', 'cancelled' のいずれかであれば、
その文字列をそのまま出力してください。
上記以外の文字列であれば、'invalid' という文字列を出力してください。

これは、対象コード中の
pattern=r"^(active|completed|paused|cancelled)$"
という制約の考え方を、リストを使った一致判定で再現する問題です。
"""
sysin_format = "文字列（str）"

sample_code = """
value = sysin

allowed_status = ["active", "completed", "paused", "cancelled"]

if value in allowed_status:
    print(value)
else:
    print("invalid")
"""

test_case_1 = {"sysin": "active", "expected": "active"}
test_case_2 = {"sysin": "paused", "expected": "paused"}
test_case_3 = {"sysin": "done", "expected": "invalid"}
```