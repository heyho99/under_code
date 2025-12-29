import httpx
from typing import List, Optional
from app.core.config import settings

class QuizClient:
    def __init__(self):
        self.base_url = settings.QUIZ_SERVICE_URL

    async def get_stats_count(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/quiz/quizzes/stats/count", params=params)
            response.raise_for_status()
            return response.json()

    async def get_stats_categories(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/quiz/quizzes/stats/categories", params=params)
            response.raise_for_status()
            return response.json()

    async def list_problem_categories(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/quiz/problem-categories", params=params)
            response.raise_for_status()
            return response.json()

    async def list_problem_languages(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/quiz/problem-languages", params=params)
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
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/quiz/quiz-sets/generate", json=data)
            response.raise_for_status()
            return response.json()

    async def get_quiz_sets(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/quiz/quiz-sets", params=params)
            response.raise_for_status()
            return response.json()

    async def get_quiz_set_detail(self, quiz_set_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/quiz/quiz-sets/{quiz_set_id}")
            response.raise_for_status()
            return response.json()

    async def get_problem(self, problem_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/quiz/problems/{problem_id}")
            response.raise_for_status()
            return response.json()

    async def delete_quiz_set(self, quiz_set_id: int) -> bool:
        """クイズセットを削除する"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(f"{self.base_url}/quiz/quiz-sets/{quiz_set_id}")
            if response.status_code == 404:
                return False
            response.raise_for_status()
            return True
