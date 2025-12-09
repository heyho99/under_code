from fastapi import FastAPI

from app.api.v1 import endpoints_validate


app = FastAPI(title="Validator Service")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(endpoints_validate.router)
