import asyncio
import httpx

from app.schemas.execute import ExecuteRequest, ExecuteResponse


PAIZA_API_BASE = "https://api.paiza.io"
PAIZA_API_KEY = "guest"

LANGUAGE_MAP = {
    "python": "python3",
    "py": "python3",
    "python3": "python3",
    "javascript": "javascript",
    "js": "javascript",
    "node": "javascript",
    "go": "go",
    "golang": "go",
}


async def _paiza_create_session(language: str, code: str, stdin: str) -> str:
    """paiza.io API でセッションを作成し、session_id を返す"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAIZA_API_BASE}/runners/create.json",
            data={
                "api_key": PAIZA_API_KEY,
                "source_code": code,
                "language": language,
                "input": stdin,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["id"]


async def _paiza_get_status(session_id: str) -> dict:
    """paiza.io API でセッションのステータスを取得"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PAIZA_API_BASE}/runners/get_status.json",
            params={
                "api_key": PAIZA_API_KEY,
                "id": session_id,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()


async def _paiza_get_details(session_id: str) -> dict:
    """paiza.io API でセッションの詳細を取得"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PAIZA_API_BASE}/runners/get_details.json",
            params={
                "api_key": PAIZA_API_KEY,
                "id": session_id,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()


async def _paiza_poll_until_completed(session_id: str, timeout_sec: int = 30, interval_sec: float = 0.5) -> None:
    """セッションが完了するまでポーリング"""
    elapsed = 0.0
    while elapsed < timeout_sec:
        status = await _paiza_get_status(session_id)
        if status.get("status") == "completed":
            return
        await asyncio.sleep(interval_sec)
        elapsed += interval_sec
    raise TimeoutError("Execution timed out")


def _map_paiza_details(details: dict) -> ExecuteResponse:
    """paiza.io の詳細レスポンスを ExecuteResponse に変換"""
    stdout = details.get("stdout") or ""
    stderr = details.get("stderr") or ""
    exit_code = details.get("exit_code")
    if exit_code is None:
        exit_code = 0 if details.get("result") == "success" else 1
    return ExecuteResponse(stdout=stdout, stderr=stderr, exitCode=exit_code)


async def execute_code(payload: ExecuteRequest) -> ExecuteResponse:
    language = (payload.language or "").lower()

    paiza_language = LANGUAGE_MAP.get(language)
    if not paiza_language:
        return ExecuteResponse(
            stdout="",
            stderr=f"Unsupported language: {payload.language}",
            exitCode=1,
        )

    try:
        session_id = await _paiza_create_session(paiza_language, payload.code, payload.stdin)
        await _paiza_poll_until_completed(session_id)
        details = await _paiza_get_details(session_id)
        return _map_paiza_details(details)
    except TimeoutError:
        return ExecuteResponse(stdout="", stderr="Execution timed out", exitCode=124)
    except Exception as e:
        return ExecuteResponse(stdout="", stderr=str(e), exitCode=1)
