#!/usr/bin/env python3
"""
プロンプト生成のテストスクリプト
各言語のプロンプトを生成して出力ディレクトリに保存します。
"""
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from app.schemas.generator import GenerateRequest, FileWithProblems
from app.services.prompt_builder import build_generation_prompt


def main():
    # テスト用のファイルコンテンツ
    test_code = '''def calculate_sum(numbers):
    """リストの合計を計算する"""
    total = 0
    for num in numbers:
        total += num
    return total

def filter_even(numbers):
    """偶数だけをフィルタリング"""
    return [n for n in numbers if n % 2 == 0]
'''
    
    # 出力ディレクトリの作成
    output_dir = Path(__file__).parent / "test_output_prompts"
    output_dir.mkdir(exist_ok=True)
    
    # テスト対象: (言語, [カテゴリリスト])
    test_cases = [
        ("python3", ["syntax", "function"]),
        ("javascript", ["syntax"]),
        ("go", ["syntax"]),
    ]
    
    for lang, categories in test_cases:
        for category in categories:
            print(f"=== {lang.upper()} / {category.upper()} のプロンプトを生成中 ===")
            
            # モックリクエストの作成
            mock_file = FileWithProblems(
                fileName="example.py",
                content=test_code,
                problemCounts={category: 3}
            )
            
            request = GenerateRequest(
                files=[mock_file],
                defaultLanguage=lang,
                title="テストクイズタイトル",
                description="このクイズはテスト用に作成されたものです。"
            )
            
            try:
                # プロンプトを生成
                prompt = build_generation_prompt(request, category=category)
                
                # ファイルに保存
                output_file = output_dir / f"{lang}_{category}_prompt.md"
                output_file.write_text(prompt, encoding="utf-8")
                
                print(f"✓ 生成成功: {output_file}")
                print(f"  - 文字数: {len(prompt)}")
                print(f"  - 行数: {len(prompt.splitlines())}")
                
                # 基本的なチェック
                checks = {
                    "問題番号のヘッダー": "# 1問目" in prompt,
                    "titleセクション": "## title" in prompt,
                    "statementセクション": "## statement" in prompt,
                    "sysinFormatセクション": "## sysinFormat" in prompt,
                    "sampleAnswerセクション": "## sampleAnswer" in prompt,
                    "testcasesセクション": "## testcases" in prompt,
                }
                
                failed_checks = [name for name, result in checks.items() if not result]
                if failed_checks:
                    print(f"  ⚠ 警告: 以下の要素が見つかりません: {', '.join(failed_checks)}")
                else:
                    print("  ✓ すべての必須セクションが含まれています")
                
            except Exception as e:
                print(f"✗ 生成失敗: {e}")
                import traceback
                traceback.print_exc()
            
            print()
    
    print(f"\n生成されたプロンプトは {output_dir} に保存されました。")
    print("ファイルを開いて内容を確認してください。")


if __name__ == "__main__":
    main()

