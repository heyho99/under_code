from fastapi import APIRouter, status
from app.schemas.auth import UserLogin, UserSignup, UserResponse

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserSignup):
    return UserResponse(
        id=1,
        username=data.username,
        email=data.email,
        token="mock-token",
    )


@router.post("/login", response_model=UserResponse)
async def login(data: UserLogin):
    return UserResponse(
        id=1,
        username="mock_user",
        email=data.email,
        token="mock-token",
    )
