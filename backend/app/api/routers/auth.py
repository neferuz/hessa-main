from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...schemas.auth import RequestCodePayload, VerifyCodePayload, AuthUserResponse, TelegramAuthPayload
from ...schemas.admin import AdminLogin, AdminResponse
from ...services.auth_service import AuthService
from ...services.admin_service import AdminService
from ...services.telegram_auth_service import TelegramAuthService

from ...schemas.qr_login import QRGenerateResponse, QRStatusResponse, QRAuthorizePayload
from ...services.qr_service import QRService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/telegram/login", response_model=AuthUserResponse)
async def telegram_login(payload: TelegramAuthPayload, db: AsyncSession = Depends(get_db)):
    """
    Авторизация через Telegram Mini App.
    """
    from fastapi import HTTPException
    service = TelegramAuthService(db)
    user = await service.authenticate(payload.initData, payload.referral_code)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Telegram data")
    return user


@router.get("/qr/generate", response_model=QRGenerateResponse)
async def generate_qr_token(db: AsyncSession = Depends(get_db)):
    service = QRService(db)
    return await service.generate_token()


@router.get("/qr/status/{token}", response_model=QRStatusResponse)
async def get_qr_status(token: str, db: AsyncSession = Depends(get_db)):
    service = QRService(db)
    return await service.get_status(token)


@router.post("/qr/authorize")
async def authorize_qr(payload: QRAuthorizePayload, db: AsyncSession = Depends(get_db)):
    service = QRService(db)
    return await service.authorize(payload)



@router.post("/request-code")
async def request_code(payload: RequestCodePayload, db: AsyncSession = Depends(get_db)):
    """
    Запросить 4‑значный код для email.
    Для dev возвращаем код прямо в ответе.
    """
    service = AuthService(db)
    return await service.request_code(payload)


@router.post("/verify-code", response_model=AuthUserResponse)
async def verify_code(payload: VerifyCodePayload, db: AsyncSession = Depends(get_db)):
    """
    Проверить код и вернуть пользователя.
    """
    service = AuthService(db)
    return await service.verify_code(payload)


@router.post("/admin/login", response_model=AdminResponse)
async def admin_login(login_data: AdminLogin, db: AsyncSession = Depends(get_db)):
    """
    Авторизация админа по логину и паролю.
    """
    service = AdminService(db)
    return await service.login(login_data)

