from fastapi import HTTPException
from app.security.security import generate_artifact
class AdminSignUpService:
    def __init__(self, repo, db):
        self.repo = repo
        self.db = db

    def admin_sign_up(self,request):
        user = self.repo.get_admin(request.email)
        if user :
            raise HTTPException(status_code=400, detail="Email already registered")
        try:
            user = self.repo.add_admin(request)
            generate_artifact(self.db,request.password,user.user_id)
            self.db.commit()
            return {"message": "Admin user created successfully"}
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail="error while adding user")