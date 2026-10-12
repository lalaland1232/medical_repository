from app.core_endpoints.cases.service import CaseService
from app.core_endpoints.cases.repo import CaseRepository
from fastapi import APIRouter, Depends, HTTPException
from app.database.db import get_db
from app.schemas.case_schema import CreateCaseRequest,UpdateCaseRequest
from app.security.security import get_permission

case_router = APIRouter()

def get_repo(db=Depends(get_db)):
    return CaseRepository(db)

def get_service(repo=Depends(get_repo), db=Depends(get_db)):
    return CaseService(repo, db)

@case_router.post("/create_case",dependencies=[Depends(get_permission("create"))])
def create_case(request:CreateCaseRequest,service=Depends(get_service)):
    return service.create_case(request)

@case_router.get("/cases")
def get_cases(page:int,filter=None,priority:int=None,surgeon_name:str=None,status:str=None,patient_refrence:str=None,service=Depends(get_service)):
    return service.get_cases(page,filter,priority=priority,surgeon_name=surgeon_name,status=status,patient_refrence=patient_refrence)

@case_router.get("/cases/{case_id}")
def get_case_by_case_id(case_id:str,service=Depends(get_service)):
    return service.get_case_by_case_id(case_id)

@case_router.patch("/cases/{case_id}",dependencies=[Depends(get_permission("update"))])
def update_status(case_id:str,request:UpdateCaseRequest,service=Depends(get_service)):
    return service.update_status(case_id,request)

@case_router.delete("/cases/{case_id}",dependencies=[Depends(get_permission("delete"))])
def delete_case(case_id:str,service=Depends(get_service)):
    return service.delete_case(case_id)
