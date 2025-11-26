import httpx
from app.core.config import settings

class ExecutorClient:
    def __init__(self):
        self.base_url = settings.EXECUTOR_SERVICE_URL

    async def execute_code(self, data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/executor/execute", json=data)
            response.raise_for_status()
            return response.json()
