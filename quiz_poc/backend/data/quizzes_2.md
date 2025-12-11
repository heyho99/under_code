# 1問目

## title
辞書内包表記による値の加工

## description
対象コードの `_prepare_response_content` 関数内にある `{k: ... for k, v in res.items()}` の処理を参考にします。
変数 `sysin` に辞書が代入されます。
辞書内包表記を使用して、元の辞書の「値 (value)」をすべて文字列型に変換した新しい辞書を作成し、それを標準出力してください。

## sysin_format
`{key: value, ...}`

## sample_code
```python:1
result = {k: str(v) for k, v in sysin.items()}
print(result)
```

## test_cases
### test_case_1
`{"sysin": {"a": 1, "b": 2}, "expected": {'a': '1', 'b': '2'}}`
### test_case_2
`{"sysin": {"x": 10.5, "y": True}, "expected": {'x': '10.5', 'y': 'True'}}`
### test_case_3
`{"sysin": {}, "expected": "{}"}`


# 2問目
## title
...
## description
...
## sysin_format
...
## sample_code
...
## test_cases
...

...

# n問目
...