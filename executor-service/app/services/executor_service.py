from pathlib import Path
import subprocess
import tempfile

from fastapi.concurrency import run_in_threadpool

from app.schemas.execute import ExecuteRequest, ExecuteResponse


def _run_python(code: str, timeout: float = 5.0) -> ExecuteResponse:
    with tempfile.TemporaryDirectory() as tmpdir:
        file_path = Path(tmpdir) / "main.py"
        file_path.write_text(code, encoding="utf-8")

        try:
            completed = subprocess.run(
                ["python", str(file_path)],
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            return ExecuteResponse(stdout="", stderr="Execution timed out", exitCode=124)

        stdout = completed.stdout or ""
        stderr = completed.stderr or ""
        return ExecuteResponse(stdout=stdout, stderr=stderr, exitCode=completed.returncode)


async def execute_code(payload: ExecuteRequest) -> ExecuteResponse:
    language = (payload.language or "").lower()

    if language not in ("python", "py"):
        return ExecuteResponse(
            stdout="",
            stderr=f"Unsupported language: {payload.language}",
            exitCode=1,
        )

    return await run_in_threadpool(_run_python, payload.code)
