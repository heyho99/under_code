import os


class Settings:
    API_PREFIX: str = "/user"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "TEST_SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_DAYS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "30"))


settings = Settings()
