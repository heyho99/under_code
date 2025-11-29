from fastapi import APIRouter, status
from app.schemas.auth import UserLogin, UserSignup, UserResponse

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserSignup):
    # 実際のユーザ登録は行わず、ユーザを返すだけ
    # UserResponseスキーマでバリデートされてJSONを返す
    return UserResponse(
        id=1,
        username=data.username,
        email=data.email,
        token="mock-token",
    )


@router.post("/login", response_model=UserResponse)
async def login(data: UserLogin):
    # 実際のユーザ認証は行わず、ユーザを返し成功したことにする
    return UserResponse(
        id=1,
        username="mock_user",
        email=data.email,
        token="mock-token",
    )
