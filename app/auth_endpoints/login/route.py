from fastapi import APIRouter, Depends, HTTPException, Request
from app.auth_endpoints.login.service import LoginService
from app.auth_endpoints.login.repo import LoginRepository
from app.database.db import get_db
from app.schemas.login_pydantic import LoginRequest
import urllib.parse
import json

login_router = APIRouter()

def get_repo(db=Depends(get_db)):
    return LoginRepository(db)

def get_service(repo=Depends(get_repo), db=Depends(get_db)):
    return LoginService(repo, db)

@login_router.post("/login")
async def login(req: Request, service=Depends(get_service)):
    content_type = req.headers.get("content-type", "")
    body_bytes = await req.body()
    
    if "application/x-www-form-urlencoded" in content_type:
        parsed = urllib.parse.parse_qs(body_bytes.decode("utf-8", errors="replace"))
        email = parsed.get("username", [None])[0] or parsed.get("email", [None])[0]
        password = parsed.get("password", [None])[0]
        if not email or not password:
            raise HTTPException(status_code=422, detail="Email and password required")
        request = LoginRequest(email=email, password=password)
    else:
        try:
            data = json.loads(body_bytes.decode("utf-8", errors="replace")) if body_bytes else {}
            request = LoginRequest(**data)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid login payload: {str(e)}")
            
    return service.login(request, req)
