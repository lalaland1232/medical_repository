from fastapi import HTTPException
from datetime import datetime, timezone
from app.config.config import settings
import jwt

class LogoutService:
    def __init__(self, repo, db):
        self.repo = repo
        self.db = db

    def logout(self, token: str, req):
        try:
            payload = jwt.decode(token, settings.SERVER_SECRET, algorithms=["HS256"])
            user_id = int(payload["id"])
            self.repo.revoke_session_by_token(token)
            self.repo.revoke_sessions_by_user_ip(user_id, req.client.host)
            self.db.commit()
            return {"message": "Logged out successfully"}
        except jwt.PyJWTError:
            session = self.repo.get_session(token)
            if session:
                self.repo.revoke_session_by_token(token)
                self.db.commit()
                return {"message": "Logged out successfully"}
            raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Error logging out: {str(e)}")
