import httpx
from typing import List, Optional
from app.core.config import settings

class QuizClient:
    def __init__(self):
        self.base_url = settings.QUIZ_SERVICE_URL

    async def get_stats_count(self):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/quiz/quizzes/stats/count")
            response.raise_for_status()
            return response.json()

    async def get_stats_categories(self):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/quiz/quizzes/stats/categories")
            response.raise_for_status()
            return response.json()

    async def upload_source_data(self, data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/api/v1/quiz/source-data", json=data)
            response.raise_for_status()
            return response.json()
            
    async def get_source_data_analysis(self, source_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/quiz/source-data/{source_id}/analysis")
            response.raise_for_status()
            return response.json()

    async def get_source_files(self, source_id: int):
        # Generatorのためにファイルの中身を取得する用 (API定義には明記ないがGeneratorフローで必要)
        # 仮のパスを設定
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/quiz/source-data/{source_id}/files")
            response.raise_for_status()
            return response.json()

    async def create_quiz_set(self, data: dict):
        # GenerateフローでBFFがGeneratorを呼んだ後、結果をQuizServiceに保存する場合
        # または、API定義通り "POST /quiz/quiz-sets/generate" に全部投げる場合
        # api.mdでは "POST /quiz/quiz-sets/generate" とあるのでそれに従う
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/api/v1/quiz/quiz-sets/generate", json=data)
            response.raise_for_status()
            return response.json()

    async def get_quiz_sets(self, user_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/quiz/quiz-sets", params={"userId": user_id})
            response.raise_for_status()
            return response.json()

    async def get_quiz_set_detail(self, quiz_set_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/quiz/quiz-sets/{quiz_set_id}")
            response.raise_for_status()
            return response.json()

    async def get_problem(self, problem_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/quiz/problems/{problem_id}")
            response.raise_for_status()
            return response.json()
