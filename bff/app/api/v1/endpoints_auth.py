from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import UserLogin, UserSignup, UserResponse
from app.clients.user_client import UserClient

router = APIRouter()
user_client = UserClient()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserSignup):
    try:
        response = await user_client.signup(data.model_dump())
        return response
    except Exception as e:
        # 本来はHTTPStatusErrorなどをキャッチして適切に返す
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=UserResponse)
async def login(data: UserLogin):
    try:
        response = await user_client.login(data.model_dump())
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail="Login failed")
