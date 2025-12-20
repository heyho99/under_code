from typing import Optional

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories import user_repository


class AuthError(Exception):
    pass


async def register_user(username: str, email: str, password: str) -> dict:
    existing = await user_repository.get_user_by_email(email)
    if existing is not None:
        raise AuthError("Email already registered")

    password_hash = hash_password(password)
    user = await user_repository.create_user(username=username, email=email, password_hash=password_hash)
    token = create_access_token(int(user["id"]))
    return {**user, "token": token}


async def login_user(email: str, password: str) -> dict:
    user = await user_repository.get_user_by_email(email)
    if user is None:
        raise AuthError("Invalid email or password")

    if not verify_password(password, str(user.get("password_hash", ""))):
        raise AuthError("Invalid email or password")

    token = create_access_token(int(user["id"]))
    return {
        "id": int(user["id"]),
        "username": user["username"],
        "email": user["email"],
        "token": token,
    }


async def get_user(user_id: int) -> Optional[dict]:
    return await user_repository.get_user_by_id(user_id)
