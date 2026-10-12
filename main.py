from fastapi import FastAPI
from app.auth_endpoints.login.route import login_router
from app.auth_endpoints.sign_up.route import sign_up_router
from app.auth_endpoints.refresh_token.route import refresh_router
from app.auth_endpoints.admin_sign_up.route import admin_sign_up_router
from app.auth_endpoints.logout.route import logout_router
from app.core_endpoints.cases.route import case_router

app=FastAPI()
app.include_router(login_router)
app.include_router(sign_up_router)
app.include_router(refresh_router)
app.include_router(admin_sign_up_router)
app.include_router(logout_router)
app.include_router(case_router)
