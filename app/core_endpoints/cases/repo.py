from app.models.models import Case
from sqlalchemy import select
class CaseRepository:
    def __init__(self, db):
        self.db = db

    def create_case(self,request):
        case = Case(
            case_id=request.case_id,
            patient_refrence=request.patient_refrence,
            surgeon_name=request.surgeon_name,
            priority=request.priority.value,
            created_by=request.created_by,
            status=request.status.value,
            implant_type=request.implant_type
        )
        self.db.add(case)

    def get_all_cases(self,page,filter=None):
        if filter:
            stmt = select(Case).order_by(Case.priority.asc()).offset((page - 1) * 10).limit(10)
            return self.db.execute(stmt).scalars().all()
        
        stmt = select(Case).order_by(Case.priority.asc()).offset((page - 1) * 10).limit(10)
        return self.db.execute(stmt).scalars().all()
    def get_cases_by_priority(self,page, priority):
        stmt = select(Case).where(Case.priority == priority).order_by(Case.priority.asc()).offset((page - 1) * 10).limit(10)
        return self.db.execute(stmt).scalars().all()
    def get_cases_by_surgeon(self, page,surgeon_name):
        stmt = select(Case).where(Case.surgeon_name == surgeon_name).order_by(Case.priority.asc()).offset((page - 1) * 10).limit(10)
        return self.db.execute(stmt).scalars().all()
    def get_cases_by_status(self, page,status):
        stmt = select(Case).where(Case.status == status).order_by(Case.priority.asc()).offset((page - 1) * 10).limit(10)
        return self.db.execute(stmt).scalars().all()
    def get_cases_by_patient_refrence(self, page,patient_refrence):
        stmt = select(Case).where(Case.patient_refrence == patient_refrence).order_by(Case.priority.asc()).offset((page - 1) * 10).limit(10)
        return self.db.execute(stmt).scalars().all()
    

    def get_case_by_case_id(self,case_id):
        stmt = select(Case).where(Case.case_id == case_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def delete_case(self,case_id):
        self.db.query(Case).filter(Case.case_id == case_id).delete()
    
