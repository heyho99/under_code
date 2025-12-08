import os
from typing import Optional

import asyncpg


_pool: Optional[asyncpg.Pool] = None


async def connect() -> None:
    global _pool
    if _pool is not None:
        return
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    _pool = await asyncpg.create_pool(database_url)


async def disconnect() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def fetch(query: str, *args):
    if _pool is None:
        raise RuntimeError("Database pool is not initialized")
    async with _pool.acquire() as connection:
        return await connection.fetch(query, *args)


async def fetchrow(query: str, *args):
    if _pool is None:
        raise RuntimeError("Database pool is not initialized")
    async with _pool.acquire() as connection:
        return await connection.fetchrow(query, *args)


async def execute(query: str, *args) -> str:
    if _pool is None:
        raise RuntimeError("Database pool is not initialized")
    async with _pool.acquire() as connection:
        return await connection.execute(query, *args)

