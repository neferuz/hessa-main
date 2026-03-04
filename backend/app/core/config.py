from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hessa API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./hessa.lls"
    BOT_TOKEN: str = "8045133629:AAGMUrr51SLiyJ37b74g71AqLVAV9HNBDd4"
    WEBAPP_URL: str = "https://hessa.uz"

    # SMTP settings for email sending
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "HESSA"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
