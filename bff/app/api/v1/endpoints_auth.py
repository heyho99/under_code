import logging

import httpx
from fastapi import APIRouter, Header, HTTPException, status

from app.clients.user_client import UserClient
from app.schemas.auth import UserLogin, UserMe, UserSignup, UserResponse

router = APIRouter()
logger = logging.getLogger(__name__)
user_client = UserClient()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserSignup):
    try:
        res = await user_client.signup(data.model_dump())
        return UserResponse(**res)
    except httpx.HTTPStatusError as e:
        detail = "User service error"
        try:
            body = e.response.json()
            if isinstance(body, dict) and body.get("detail"):
                detail = body.get("detail")
        except Exception:
            pass
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    except Exception:
        logger.exception("Failed to signup via user service")
        raise HTTPException(status_code=502, detail="Failed to signup")


@router.post("/login", response_model=UserResponse)
async def login(data: UserLogin):
    try:
        res = await user_client.login(data.model_dump())
        return UserResponse(**res)
    except httpx.HTTPStatusError as e:
        detail = "User service error"
        try:
            body = e.response.json()
            if isinstance(body, dict) and body.get("detail"):
                detail = body.get("detail")
        except Exception:
            pass
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    except Exception:
        logger.exception("Failed to login via user service")
        raise HTTPException(status_code=502, detail="Failed to login")


@router.get("/me", response_model=UserMe)
async def me(authorization: str = Header(...)):
    try:
        res = await user_client.me(authorization)
        return UserMe(**res)
    except httpx.HTTPStatusError as e:
        detail = "User service error"
        try:
            body = e.response.json()
            if isinstance(body, dict) and body.get("detail"):
                detail = body.get("detail")
        except Exception:
            pass
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    except Exception:
        logger.exception("Failed to fetch me via user service")
        raise HTTPException(status_code=502, detail="Failed to fetch user")
