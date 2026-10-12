from app.models.models import Session,User

class RefreshRepository:
    def __init__(self,db):
        self.db = db

    def get_session(self,token):
        session = self.db.query(Session).filter(Session.token == token).first()
        
        return session
    def get_user(self,user_id):
        print("Fetching user with ID:", user_id)  # Debugging line
        user = self.db.query(User).filter(User.user_id == user_id).first()
        return user
    def create_session(self,user,req,refresh_token):
            session = Session(
                ip_address=req.client.host,
                device_name=req.headers.get("user-agent"),
                user_id=user.user_id,
                token=refresh_token
            )
            self.db.add(session)
