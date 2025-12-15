import os
from typing import Any, Dict, List

import httpx


class LLMError(RuntimeError):
    pass


async def call_llm(prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise LLMError("OPENAI_API_KEY is not set")

    model = os.getenv("OPENAI_MODEL", "gpt-5.1")
    base_url = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
    reasoning_effort = os.getenv("OPENAI_REASONING_EFFORT", "none")
    text_verbosity = os.getenv("OPENAI_TEXT_VERBOSITY", "medium")

    url = f"{base_url.rstrip('/')}/responses"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": model,
        "input": prompt,
        "reasoning": {"effort": reasoning_effort},
        "text": {"verbosity": text_verbosity},
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
        except httpx.RequestError as exc:
            raise LLMError(f"LLM API request failed: {exc}") from exc
        except httpx.HTTPStatusError as exc:
            raise LLMError(
                f"LLM API returned error status {exc.response.status_code}: {exc.response.text}"
            ) from exc

    data = response.json()
    texts: List[str] = []
    for item in data.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                text = content.get("text")
                if isinstance(text, str):
                    texts.append(text)

    if not texts:
        raise LLMError(f"Unexpected LLM API response (no output_text): {data}")

    return "\n".join(texts)
