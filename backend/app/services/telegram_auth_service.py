import hashlib
import hmac
import json
import urllib.parse
from typing import Dict, Any, Tuple
from ..core.config import settings
from ..repositories.user_repository import UserRepository
from ..models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from operator import itemgetter

class TelegramAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    def validate_init_data(self, init_data: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate Telegram initData signature.
        Algorithm:
        1. Parse query string.
        2. Sort key-value pairs alphabetically.
        3. Create data_check_string by joining pairs (k=v) with \n.
        4. Create secret_key: HMAC_SHA256(bot_token, "WebAppData").
        5. Verify hash.
        """
        try:
            parsed_data = dict(urllib.parse.parse_qsl(init_data))
            if 'hash' not in parsed_data:
                return False, {}

            tg_hash = parsed_data.pop('hash')
            
            # Sort items and create check string
            items = sorted(parsed_data.items(), key=itemgetter(0))
            data_check_string = "\n".join([f"{k}={v}" for k, v in items])

            # Secret key: HMAC_SHA256(bot_token, "WebAppData")
            secret_key = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
            calc_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

            if calc_hash == tg_hash:
                # Success
                user_data = json.loads(parsed_data.get('user', '{}'))
                return True, user_data
            
            return False, {}
        except Exception as e:
            print(f"Auth error: {e}")
            return False, {}

    async def authenticate(self, init_data: str, referral_code: str = None) -> Any:
        success, user_data = self.validate_init_data(init_data)
        if not success:
            return None

        tg_id = str(user_data.get('id'))
        if not tg_id:
            return None

        # Try to find user by telegram_id
        user = await self.user_repo.get_by_telegram_id(tg_id)
        
        if not user:
            # Create new user
            username = user_data.get('username') or f"user_{tg_id}"
            first_name = user_data.get('first_name', '')
            last_name = user_data.get('last_name', '')
            full_name = f"{first_name} {last_name}".strip()
            
            user_in = {
                "username": username,
                "email": f"{username}@telegram.tg", # Placeholder email
                "hashed_password": "tg_auth_placeholder",
                "telegram_id": tg_id,
                "full_name": full_name or username,
                "referral_code": None, # Will be generated on repository side usually or manually here
                "is_active": True
            }
            # Re-fetch or create logic depends on repo, let's assume create works
            # We might want a check if email exists etc. but for TG we follow this.
            
            # For Hessa, we use specific creation logic if needed.
            # Let's use repo directly.
            from ..models.user import User as UserModel
            import uuid
            
            new_user = UserModel(
                username=username,
                email=user_in["email"],
                hashed_password="tg_auth_placeholder",
                telegram_id=tg_id,
                full_name=user_in["full_name"],
                referral_code=uuid.uuid4().hex[:8].upper()
            )
            
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            user = new_user

        return user
