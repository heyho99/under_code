from fastapi import FastAPI

from app.api.v1 import endpoints_quiz_sets, endpoints_problems


app = FastAPI(title="Quiz Service")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(endpoints_quiz_sets.router, prefix="/api/v1")
app.include_router(endpoints_problems.router, prefix="/api/v1")

