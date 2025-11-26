import httpx
from app.core.config import settings

class TutorClient:
    def __init__(self):
        self.base_url = settings.TUTOR_SERVICE_URL

    async def get_hint(self, data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/tutor/hint", json=data)
            response.raise_for_status()
            return response.json()
