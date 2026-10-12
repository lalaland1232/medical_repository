from dotenv import load_dotenv
import os
from dataclasses import dataclass
load_dotenv()
@dataclass(frozen=True)
class Settings():
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SERVER_SECRET: str = os.getenv("SERVER_SECRET")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

settings = Settings()