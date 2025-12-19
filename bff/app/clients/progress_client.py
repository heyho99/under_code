import httpx
from typing import List
from app.core.config import settings

class ProgressClient:
    def __init__(self):
        self.base_url = settings.PROGRESS_SERVICE_URL

    async def get_unique_solved_count(self, user_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/progress/stats/unique-solved", params={"userId": user_id})
            response.raise_for_status()
            return response.json()

    async def get_activities(self, user_id: int, period: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/progress/activities", params={"userId": user_id, "period": period})
            response.raise_for_status()
            return response.json()

    async def get_solved_problems(self, user_id: int, problem_ids: List[int]):
        ids_str = ",".join(map(str, problem_ids))
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/progress/solved-problems",
                params={"userId": user_id, "problemIds": ids_str},
            )
            response.raise_for_status()
            return response.json()
    
    async def save_submission(self, data: dict):
        # 採点結果の保存
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/progress/submissions", json=data)
            response.raise_for_status()
            return response.json()
