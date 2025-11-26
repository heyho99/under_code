import httpx
from app.core.config import settings

class ValidatorClient:
    def __init__(self):
        self.base_url = settings.VALIDATOR_SERVICE_URL

    async def validate_submission(self, data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/validator/validate", json=data)
            response.raise_for_status()
            return response.json()
