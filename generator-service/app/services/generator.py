from app.schemas.generator import GenerateRequest, GenerateResponse
from app.services.prompt_builder import build_prompt_from_request
from app.clients.llm_client import call_llm
from app.services.quizzes_parser import parse_quizzes_from_markdown


async def generate_quiz_set(request: GenerateRequest) -> GenerateResponse:
    """Orchestrate prompt building, LLM call, and Markdown parsing to generate quizzes.

    This function mirrors the PoC flow of llm_creator.py + extract_quizzes.py but runs entirely
    in memory and returns JSON-ready data instead of writing quizzes.md/quizzes.json files.
    """

    prompt = build_prompt_from_request(request)
    markdown = await call_llm(prompt)
    quizzes = parse_quizzes_from_markdown(markdown)
    return GenerateResponse(quizzes=quizzes)
