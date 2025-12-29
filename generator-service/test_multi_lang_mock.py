"""
テストスクリプト: 複数ファイル・異なる言語のモックデータ検証

このスクリプトはGENERATOR_MOCK=1モードで、
複数のファイル（Python, Go）がそれぞれ適切なモックデータを受け取ることを確認します。
"""

import sys
import os

# プロジェクトルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ["GENERATOR_MOCK"] = "1"

from app.schemas.generator import GenerateRequest, FileWithProblems


async def test_multi_file_multi_language():
    """複数ファイル・異なる言語のモックテスト"""
    
    # Python ファイル
    python_file = FileWithProblems(
        fileName="sample.py",
        defaultLanguage="python3",
        content="# Python sample file",
        problemCounts={"syntax": 2},
    )
    
    # Go ファイル
    go_file = FileWithProblems(
        fileName="sample.go",
        defaultLanguage="go",
        content="// Go sample file",
        problemCounts={"syntax": 2},
    )
    
    # リクエスト作成
    request = GenerateRequest(
        userId=1,
        title="マルチ言語テスト",
        description="Python と Go のモックデータ検証",
        defaultLanguage="python3",
        files=[python_file, go_file],
    )
    
    # generate 関数を呼び出す
    from app.services.generator import generate
    
    response = await generate(request)
    
    print(f"✅ 生成された問題数: {len(response.problems)}")
    print()
    
    for i, problem in enumerate(response.problems, 1):
        print(f"問題 {i}:")
        print(f"  タイトル: {problem.title}")
        print(f"  デフォルト言語: {problem.defaultLanguage}")
        print(f"  サンプル解答の言語: {problem.sampleAnswer[:50]}...")
        print()
    
    # 検証
    assert len(response.problems) == 4, f"Expected 4 problems, got {len(response.problems)}"
    
    # 最初の2問はPython (import キーワードで判定)
    assert "import" in response.problems[0].sampleAnswer, "Problem 1 should be Python"
    assert "import" in response.problems[1].sampleAnswer, "Problem 2 should be Python"
    
    # 次の2問はGo
    assert "package main" in response.problems[2].sampleAnswer, "Problem 3 should be Go"
    assert "package main" in response.problems[3].sampleAnswer, "Problem 4 should be Go"
    
    print("🎉 すべてのテストが成功しました！")
    print()
    print("【確認事項】")
    print("- Python用ファイルには2問のPython問題が生成されました")
    print("- Go用ファイルには2問のGo問題が生成されました")
    print("- 合計4問の異なる問題が生成されました")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_multi_file_multi_language())
