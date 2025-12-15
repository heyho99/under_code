from fastapi import FastAPI

from app.api.v1 import endpoints_generate, endpoints_tutor


app = FastAPI(title="Generator Service")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(endpoints_generate.router, prefix="/api/v1")
app.include_router(endpoints_tutor.router, prefix="/api/v1")
