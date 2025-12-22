import os
from pathlib import Path
from typing import Optional

import asyncpg


_pool: Optional[asyncpg.Pool] = None


async def _apply_migrations(connection: asyncpg.Connection) -> None:
    migrations_dir = Path(__file__).resolve().parents[2] / "migrations"
    if not migrations_dir.exists():
        return

    await connection.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
          filename TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )

    rows = await connection.fetch("SELECT filename FROM schema_migrations")
    applied = {str(r["filename"]) for r in rows}

    migration_files = sorted(p for p in migrations_dir.glob("*.sql") if p.is_file())
    for path in migration_files:
        filename = path.name
        if filename in applied:
            continue

        sql = path.read_text(encoding="utf-8")
        if not sql.strip():
            continue

        async with connection.transaction():
            await connection.execute(sql)
            await connection.execute(
                "INSERT INTO schema_migrations (filename) VALUES ($1)",
                filename,
            )


async def connect() -> None:
    global _pool
    if _pool is not None:
        return

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")

    _pool = await asyncpg.create_pool(database_url)

    async with _pool.acquire() as connection:
        await _apply_migrations(connection)


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
