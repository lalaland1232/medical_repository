
from app.models.models import User


class SignUpRepository:
    def __init__(self,db):
        self.db = db

    def get_user(self,email:str):
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self,request):
        user = User(
            name=request.name,
            email=request.email,
            role_id=6
            
        )
        self.db.add(user)
        self.db.flush()
        return user