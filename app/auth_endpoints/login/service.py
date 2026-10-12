from fastapi import HTTPException
import hashlib
from app.security.security import get_current_user,generate_access_token,generate_refresh_token,check_password
class LoginService:
    def __init__(self,repo,db):
        self.repo=repo
        self.db=db

    def login(self,request,req):
        print("login service")
        user = self.repo.get_user(request.email)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not check_password(request.password, user.user_id,self.db):
            raise HTTPException(status_code=401, detail="Invalid password")


        try:
            access_token = generate_access_token(user, user.role_id)
            refresh_token= generate_refresh_token(user)
            hashed_token = hashlib.sha256(refresh_token.encode()).hexdigest()
            client_ip = req.client.host if req.client else "127.0.0.1"
            self.repo.set_all_active_sessions_from_same_ip_inactive(client_ip,user.user_id)
            self.repo.create_session(user,req,hashed_token)
            self.db.commit()
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
        except Exception as e:
            print("Error generating access token:", str(e))
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Error generating access token: {str(e)}")