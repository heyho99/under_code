from typing import Optional

from app.db import database


async def create_user(username: str, email: str, password_hash: str) -> dict:
    row = await database.fetchrow(
        """
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email
        """,
        username,
        email,
        password_hash,
    )
    return dict(row) if row is not None else {}


async def get_user_by_email(email: str) -> Optional[dict]:
    row = await database.fetchrow(
        """
        SELECT id, username, email, password_hash
        FROM users
        WHERE email = $1
        """,
        email,
    )
    return dict(row) if row is not None else None


async def get_user_by_id(user_id: int) -> Optional[dict]:
    row = await database.fetchrow(
        """
        SELECT id, username, email
        FROM users
        WHERE id = $1
        """,
        user_id,
    )
    return dict(row) if row is not None else None
