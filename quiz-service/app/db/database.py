import json
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

    async def _init_connection(conn: asyncpg.Connection) -> None:
        await conn.set_type_codec(
            "json",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )
        await conn.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )

    _pool = await asyncpg.create_pool(database_url, init=_init_connection)


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

