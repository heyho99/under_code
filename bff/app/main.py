from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1 import (
    endpoints_auth,
    endpoints_dashboard,
    endpoints_quiz_creation,
    endpoints_quiz_sets,
    endpoints_play,
    endpoints_submissions
)

# Setup logging
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from BFF Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include Routers
app.include_router(
    endpoints_auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"]
)

app.include_router(
    endpoints_dashboard.router,
    prefix=f"{settings.API_V1_STR}/dashboard",
    tags=["dashboard"]
)

app.include_router(
    endpoints_quiz_creation.router,
    prefix=f"{settings.API_V1_STR}/quiz-creation",
    tags=["quiz-creation"]
)

app.include_router(
    endpoints_quiz_sets.router,
    prefix=f"{settings.API_V1_STR}/quiz-sets",
    tags=["quiz-sets"]
)

app.include_router(
    endpoints_play.router,
    prefix=f"{settings.API_V1_STR}/problems",
    tags=["play"]
)

# submissions系はパスが /runner/execute と /submissions に分かれているが
# endpoints_submissions.router 内で定義されているので
# プレフィックスなし (または共通部分のみ) でマウントする手もあるが、
# ここでは単純に endpoints_submissions.router 内の定義が相対パスであることを考慮し
# API_V1_STR 直下にマウントする。
# endpoints_submissions.py 側: @router.post("/runner/execute") -> /api/v1/runner/execute
app.include_router(
    endpoints_submissions.router,
    prefix=settings.API_V1_STR,
    tags=["submissions"]
)
