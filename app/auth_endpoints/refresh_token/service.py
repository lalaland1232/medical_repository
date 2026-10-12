from fastapi import HTTPException
from datetime import datetime,timezone
import hashlib
from sqlalchemy import select
from app.security.security import generate_access_token,generate_refresh_token
from app.config.config import settings
from app.models.models import Session
import jwt
class RefreshService:
    def __init__(self,repo,db):
        self.repo = repo
        self.db = db

    def refresh_token(self,token,req):
        hashed_token = hashlib.sha256(token.encode()).hexdigest()
        session=self.repo.get_session(hashed_token)
        if session is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        if session.revoked_at is not None:
            raise HTTPException(status_code=401, detail="Token has been revoked")
        try:
            payload = jwt.decode(token, settings.SERVER_SECRET, algorithms=["HS256"])
            
            user_id=int(payload["id"])
           
            user=self.repo.get_user(user_id)
           
            session.revoked_at = datetime.now(timezone.utc)
            refresh_token= generate_refresh_token(user)
            access_token= generate_access_token(user,user.role_id)
            hashed_refresh_token = hashlib.sha256(refresh_token.encode()).hexdigest()
            self.repo.create_session(user,req,hashed_token=hashed_refresh_token)
            self.db.commit()
           
            return {"access_token": access_token, "refresh_token": refresh_token}

        except Exception as e:
            print("Error decoding token:", str(e))  # Debugging line
            raise HTTPException(status_code=401, detail="Invalid token{str(e)}")