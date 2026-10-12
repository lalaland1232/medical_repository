from fastapi import APIRouter, Depends,Request
from app.auth_endpoints.admin_sign_up.service import AdminSignUpService
from app.auth_endpoints.admin_sign_up.repo import AdminSignUpRepository
from app.security.security import get_permission
from app.database.db import get_db
from app.schemas.sign_up_schema import SignUpRequest

admin_sign_up_router = APIRouter()

def get_admin_sign_up_repo(db=Depends(get_db)):
    return AdminSignUpRepository(db)

def get_admin_sign_up_service(repo=Depends(get_admin_sign_up_repo),db=Depends(get_db)):
    return AdminSignUpService(repo,db)

@admin_sign_up_router.post("/admin_sign_up",dependencies=[Depends(get_permission("create_admin"))])
def sign_up(request: SignUpRequest, admin_sign_up_service=Depends(get_admin_sign_up_service)):
    return admin_sign_up_service.admin_sign_up(request)
