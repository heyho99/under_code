import httpx
from app.core.config import settings

class GeneratorClient:
    def __init__(self):
        self.base_url = settings.GENERATOR_SERVICE_URL
    
    # API定義上は、BFFが直接Generatorを呼ぶケースはv1では明記されていない(QuizServiceが呼ぶフローになっている記述もある)
    # しかし、"POST /api/quiz-creation/generate" の説明では
    # "3. ファイル内容とクイズ設定をあわせて Generator に投げ、問題(problems)を生成させる"
    # とあるので、BFFがオーケストレーションするならここが必要。
    
    async def generate_problems(self, data: dict):
        async with httpx.AsyncClient(timeout=60.0) as client: # LLMは時間がかかるのでタイムアウト長め
            response = await client.post(f"{self.base_url}/generator/generate", json=data)
            response.raise_for_status()
            return response.json()
