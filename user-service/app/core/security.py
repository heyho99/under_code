import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt, expected = password_hash.split("$", 1)
    except ValueError:
        return False
    digest = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return secrets.compare_digest(digest, expected)


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    payload: Dict[str, Any] = {
        "userId": user_id,
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as e:
        raise ValueError("Invalid token") from e
