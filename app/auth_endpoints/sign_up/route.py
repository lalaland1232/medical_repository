from fastapi import APIRouter, Depends,Request
from app.auth_endpoints.sign_up.service import SignUpService
from app.auth_endpoints.sign_up.repo import SignUpRepository
from app.database.db import get_db
from app.schemas.sign_up_schema import SignUpRequest

sign_up_router = APIRouter()

def get_sign_up_repo(db=Depends(get_db)):
    return SignUpRepository(db)

def get_sign_up_service(repo=Depends(get_sign_up_repo),db=Depends(get_db)):
    return SignUpService(repo,db)

@sign_up_router.post("/sign_up")
def sign_up(request: SignUpRequest, sign_up_service=Depends(get_sign_up_service)):
    return sign_up_service.sign_up(request)