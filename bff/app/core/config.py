from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Under Code BFF"
    
    # Service URLs
    USER_SERVICE_URL: str = "http://user-service:80"
    QUIZ_SERVICE_URL: str = "http://quiz-service:80"
    PROGRESS_SERVICE_URL: str = "http://progress-service:80"
    GENERATOR_SERVICE_URL: str = "http://generator-service:80"
    EXECUTOR_SERVICE_URL: str = "http://executor-service:80"
    VALIDATOR_SERVICE_URL: str = "http://validator-service:80"
    TUTOR_SERVICE_URL: str = "http://tutor-service:80"

    # Security
    # 本番環境では適切なシークレットキーを設定する必要があります
    SECRET_KEY: str = "TEST_SECRET_KEY" 
    ALGORITHM: str = "HS256"

    class Config:
        case_sensitive = True

settings = Settings()
