from fastapi import FastAPI

from app.api.v1 import endpoints_quiz_sets, endpoints_problems
from app.db import database


app = FastAPI(title="Quiz Service")


@app.on_event("startup")
async def on_startup() -> None:
    await database.connect()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await database.disconnect()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(endpoints_quiz_sets.router, prefix="/api/v1")
app.include_router(endpoints_problems.router, prefix="/api/v1")
