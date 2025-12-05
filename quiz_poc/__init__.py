"""quiz_poc パッケージのエントリポイント。

Flask アプリケーションのインスタンス app を公開し、
外部からは `from quiz_poc import app` で利用できるようにする。
"""

from .backend import app

__all__ = ["app"]
