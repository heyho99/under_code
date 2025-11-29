from fastapi import APIRouter, HTTPException, status
from app.schemas.quiz_creation import SourceUploadRequest, SourceUploadResponse, GenerateQuizRequest, GenerateQuizResponse
from app.clients.quiz_client import QuizClient
from app.clients.generator_client import GeneratorClient

router = APIRouter()
quiz_client = QuizClient()
generator_client = GeneratorClient()

@router.post("/upload", response_model=SourceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_source(data: SourceUploadRequest):
    try:
        response = await quiz_client.upload_source_data(data.model_dump())
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=GenerateQuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(data: GenerateQuizRequest):
    try:
        # 1. ソースコードの中身を取得 (Quiz Service)
        # data.sourceId を使用
        # ※ api.mdのフローに従い、BFFがファイルコンテンツを取得してGeneratorに渡す
        source_files_resp = await quiz_client.get_source_files(data.sourceId)
        files = source_files_resp.get("files", []) # [{"path": "...", "content": "..."}]

        # 2. Generatorにクイズ生成を依頼
        # Prompt構成に必要な情報を渡す
        generator_payload = {
            "files": files,
            "problemCounts": data.problemCounts.model_dump(by_alias=True),
            "customInstruction": data.customInstruction,
            "excludePaths": data.excludePaths
        }
        generated_problems_resp = await generator_client.generate_problems(generator_payload)
        problems = generated_problems_resp.get("problems", [])

        # 3. 生成された問題を保存 (Quiz Service)
        save_payload = {
            "userId": data.userId,
            "sourceId": data.sourceId,
            "title": data.title,
            "problems": problems
        }
        save_resp = await quiz_client.create_quiz_set(save_payload)
        
        return save_resp
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
