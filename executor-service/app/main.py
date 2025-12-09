from fastapi import FastAPI

from app.api.v1 import endpoints_execute


app = FastAPI(title="Executor Service")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(endpoints_execute.router)
