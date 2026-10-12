from fastapi import APIRouter, Depends, HTTPException, Request
from app.auth_endpoints.logout.service import LogoutService
from app.auth_endpoints.logout.repo import LogoutRepository
from app.database.db import get_db
from app.security.security import get_token

logout_router = APIRouter()

def get_repo(db=Depends(get_db)):
    return LogoutRepository(db)

def get_service(repo=Depends(get_repo), db=Depends(get_db)):
    return LogoutService(repo, db)

@logout_router.post("/logout")
def logout(req: Request, token=Depends(get_token), service=Depends(get_service)):
    return service.logout(token, req)
