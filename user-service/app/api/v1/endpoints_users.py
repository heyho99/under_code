from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.security import decode_token
from app.schemas.user import UserCreate, UserLogin, UserMe, UserResponse
from app.services.user_service import AuthError, get_user, login_user, register_user


router = APIRouter(prefix="/user/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate) -> UserResponse:
    try:
        data = await register_user(username=payload.username, email=payload.email, password=payload.password)
        return UserResponse(**data)
    except AuthError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=UserResponse)
async def login(payload: UserLogin) -> UserResponse:
    try:
        data = await login_user(email=payload.email, password=payload.password)
        return UserResponse(**data)
    except AuthError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


def _get_current_user_id(authorization: str = Header(...)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    for key in ("userId", "user_id", "id", "sub"):
        if key not in payload:
            continue
        try:
            return int(payload.get(key))
        except Exception:
            continue

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


@router.get("/me", response_model=UserMe)
async def me(user_id: int = Depends(_get_current_user_id)) -> UserMe:
    user = await get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserMe(**user)
