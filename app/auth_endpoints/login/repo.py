
from sqlalchemy import update
from datetime import datetime, timezone

from app.models.models import User,Session


class LoginRepository:
    def __init__(self,db):
        self.db=db

    def get_user(self,email:str):
        return self.db.query(User).filter(User.email==email).first()

    def create_session(self,user,req,hashed_token):
        ip = str(req.client.host) if req.client else "127.0.0.1"
        ua = str(req.headers.get("user-agent")) if req.headers else None
        session = Session(
            ip_address=ip,
            device_name=ua,
            user_id=user.user_id,
            hashed_token=hashed_token
        )
        self.db.add(session)
        return session
    def set_all_active_sessions_from_same_ip_inactive(self,ip_address,user_id):
        stmt = update(Session).where(Session.ip_address == ip_address, Session.user_id == user_id, Session.revoked_at ==None).values(revoked_at=datetime.now(timezone.utc))  
        self.db.execute(stmt)
