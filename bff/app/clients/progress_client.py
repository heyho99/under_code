import httpx
from typing import List, Optional
from app.core.config import settings

class ProgressClient:
    def __init__(self):
        self.base_url = settings.PROGRESS_SERVICE_URL

    async def get_unique_solved_count(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/progress/stats/unique-solved", params=params)
            response.raise_for_status()
            return response.json()

    async def get_unique_attempted_count(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/progress/stats/unique-attempted", params=params)
            response.raise_for_status()
            return response.json()

    async def get_activities(self, user_id: Optional[int], period: int):
        async with httpx.AsyncClient() as client:
            params = {"period": period}
            if user_id is not None:
                params["userId"] = user_id
            response = await client.get(f"{self.base_url}/progress/activities", params=params)
            response.raise_for_status()
            return response.json()

    async def get_solved_problems(self, user_id: Optional[int], problem_ids: List[int]):
        ids_str = ",".join(map(str, problem_ids))
        async with httpx.AsyncClient() as client:
            params = {"problemIds": ids_str}
            if user_id is not None:
                params["userId"] = user_id
            response = await client.get(
                f"{self.base_url}/progress/solved-problems",
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def get_attempted_problems(self, user_id: Optional[int], problem_ids: List[int]):
        ids_str = ",".join(map(str, problem_ids))
        async with httpx.AsyncClient() as client:
            params = {"problemIds": ids_str}
            if user_id is not None:
                params["userId"] = user_id
            response = await client.get(
                f"{self.base_url}/progress/attempted-problems",
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def get_language_stats(self, user_id: Optional[int]):
        async with httpx.AsyncClient() as client:
            params = {"userId": user_id} if user_id is not None else None
            response = await client.get(f"{self.base_url}/progress/stats/languages", params=params)
            response.raise_for_status()
            return response.json()
    
    async def save_submission(self, data: dict):
        # 採点結果の保存
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/progress/submissions", json=data)
            response.raise_for_status()
            return response.json()
