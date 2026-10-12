from fastapi import APIRouter, Depends, HTTPException,Request
from app.auth_endpoints.refresh_token.service import RefreshService
from app.auth_endpoints.refresh_token.repo import RefreshRepository
from app.database.db import get_db
from app.security.security import get_token
refresh_router = APIRouter()

def get_repo(db=Depends(get_db)):
    return RefreshRepository(db)

def get_service(repo=Depends(get_repo), db=Depends(get_db)):
    return RefreshService(repo, db)

@refresh_router.post("/refresh_token")
def refresh_token(req:Request,token=Depends(get_token),service=Depends(get_service)):
    return service.refresh_token(token,req) 