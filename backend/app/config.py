import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    supabase_url: str = os.getenv('SUPABASE_URL', '')
    supabase_key: str = os.getenv('SUPABASE_KEY', '')
    supabase_bucket: str = os.getenv('SUPABASE_BUCKET', 'complaint-photos')
    frontend_origin: str = os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')


settings = Settings()
