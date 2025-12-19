from fastapi import FastAPI

from app.api.v1 import endpoints_progress
from app.db import database


app = FastAPI(title="Progress Service")


@app.on_event("startup")
async def on_startup() -> None:
    await database.connect()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await database.disconnect()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(endpoints_progress.router)
