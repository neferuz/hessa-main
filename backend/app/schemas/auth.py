from pydantic import BaseModel, EmailStr

from .user import UserResponse


class RequestCodePayload(BaseModel):
    email: EmailStr
    context: str | None = "login"  # 'login' | 'quiz'


class VerifyCodePayload(BaseModel):
    email: EmailStr
    code: str
    context: str | None = "login"
    full_name: str | None = None


class AuthUserResponse(UserResponse):
    """
    Ответ при успешной проверке кода.
    Пока без JWT/куков — фронт сохраняет это в localStorage.
    """

    pass


class TelegramAuthPayload(BaseModel):
    initData: str
    referral_code: str | None = None

