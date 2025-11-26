import httpx
from app.core.config import settings

class UserClient:
    def __init__(self):
        self.base_url = settings.USER_SERVICE_URL

    async def login(self, data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/user/users/login", json=data)
            response.raise_for_status()
            return response.json()
    
    async def signup(self, data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/user/users", json=data)
            response.raise_for_status()
            return response.json()
