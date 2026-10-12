import jwt
from fastapi import Depends,HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.config.config import settings
from datetime import datetime, timedelta,timezone
import bcrypt
from app.repository.repo import store_artifact,get_artifact,get_user,find_permission
from app.database.db import get_db

fetch_token = OAuth2PasswordBearer(tokenUrl="/login")

def get_token(token=Depends(fetch_token)):
    print("Token received:", token)  # Debugging line
    return token

def generate_token(payload,header,secret):

    try:
       token = jwt.encode(payload, secret, algorithm="HS256", headers=header)
       
       return token
    except Exception as e:
        raise Exception({"message": str(e)})   

def generate_access_token(user,role_id):
    
    payload={
        "id":str(user.user_id),
        "email":user.email,
        "role_id":role_id,
        "name":user.name,
        "type":"access",
        "exp":datetime.now(timezone.utc)+timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    header={
        "alg":"HS256"}
    return generate_token(payload,header,settings.SERVER_SECRET)

def generate_refresh_token(user):
    payload={
        "id":str(user.user_id),
        "email":user.email,
        "type":"refresh",
        "exp":datetime.now(timezone.utc)+timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    }
    header={
        "alg":"HS256"}
    return generate_token(payload,header,settings.SERVER_SECRET)

def generate_artifact(db,password,user_id):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    store_artifact(db,hashed_password,user_id)    
    
def check_password(password,user_id,db):
    hashed_password = get_artifact(user_id,db)
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

def get_current_user(db=Depends(get_db),token=Depends(get_token)):
    user_id = jwt.decode(token, settings.SERVER_SECRET, algorithms=["HS256"])["id"]
    user = get_user(db,int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user

def get_permission(permission:str):
    def checker(user=Depends(get_current_user),db=Depends(get_db)):
        print("user",user)  
        role_id=user.role_id
        print("role_id",role_id)
        permission_exists = find_permission(db,permission,role_id)
        if not permission_exists:
            raise HTTPException(status_code=403, detail="Permission denied")
        return True
    return checker
