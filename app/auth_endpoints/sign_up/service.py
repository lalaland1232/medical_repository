from fastapi import HTTPException
from app.security.security import generate_artifact
class SignUpService:
    def __init__(self,repo,db):
        self.repo = repo
        self.db = db

    def sign_up(self, request):
        user = self.repo.get_user(request.email)
        if user:
            raise HTTPException(status_code=400, detail="Email already registered")

        try:
            user=self.repo.create_user(request)
            print(user.user_id)
            generate_artifact(self.db,request.password,user.user_id)
            self.db.commit()
            return {"message": "User created successfully"}
        except Exception as e:
            self.db.rollback()
            print(f"Error while creating user: {str(e)}")
            raise HTTPException(status_code=500, detail="error while creating user{str(e)}")

            