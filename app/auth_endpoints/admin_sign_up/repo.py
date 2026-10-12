
from app.models.models import User


class AdminSignUpRepository:
    def __init__(self, db):
        self.db = db

    def get_admin(self, email: str):
        return self.db.query(User).filter(User.email == email).first()
    def add_admin(self, request):
        user = User(
            name=request.name,
            email=request.email,
            role_id=5
        )
        self.db.add(user)
        self.db.flush()
        return user
        
            