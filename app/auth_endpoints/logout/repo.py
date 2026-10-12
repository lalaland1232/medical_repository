from sqlalchemy import update
from datetime import datetime, timezone
from app.models.models import Session

class LogoutRepository:
    def __init__(self, db):
        self.db = db

    def get_session(self, token: str):
        return self.db.query(Session).filter(Session.token == token).first()

    def revoke_session_by_token(self, token: str):
        stmt = update(Session).where(Session.token == token, Session.revoked_at == None).values(revoked_at=datetime.now(timezone.utc))
        self.db.execute(stmt)

    def revoke_sessions_by_user_ip(self, user_id: int, ip_address: str):
        stmt = update(Session).where(Session.user_id == user_id, Session.ip_address == ip_address, Session.revoked_at == None).values(revoked_at=datetime.now(timezone.utc))
        self.db.execute(stmt)

