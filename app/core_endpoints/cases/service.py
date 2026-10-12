from fastapi import HTTPException
import logging
class CaseService:
    def __init__(self, repo, db):
        self.repo = repo
        self.db = db

    def create_case(self,request):
        try:
            self.repo.create_case(request)
            self.db.commit()
            return {"message": "Case created successfully"}
        except Exception as e:
            self.db.rollback()
            logging.error(f"Failed to create case: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create case: {str(e)}")

    def get_cases(self,page,filter,priority,surgeon_name,status,patient_refrence):
        try:
            
            if priority:
                cases = self.repo.get_cases_by_priority(priority)
            elif surgeon_name:
                cases = self.repo.get_cases_by_surgeon(page,surgeon_name)
            elif status:
                cases = self.repo.get_cases_by_status(page,status)
            elif patient_refrence:
                cases = self.repo.get_cases_by_patient_refrence(page,patient_refrence)
            else:
                if filter :
                    cases = self.repo.get_all_cases(page,filter)
                
                cases = self.repo.get_all_cases(page,filter)
            return cases
            
        except Exception as e:
            logging.error(f"Failed to retrieve cases: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to retrieve cases: {str(e)}")

    def get_case_by_case_id(self,case_id):
            try:
                case= self.repo.get_case_by_case_id(case_id)
                if case is None:
                    raise HTTPException(status_code=404, detail="Case not found")
                return case
            except Exception as e:
                logging.error(f"Failed to retrieve case by case_id: {str(e)}")
                raise HTTPException(status_code=500, detail="Failed to retrieve case by case_id: {str(e)}")

    def update_status(self,case_id,request):
        case= self.repo.get_case_by_case_id(case_id)
        if case is None:
            raise HTTPException(status_code=404, detail="Case not found")
        case.status=request.status.value
        logging.info(f"Updating case_id {case_id} status to {request.status.value}")
        self.db.commit()
        return {"message": "Case status updated successfully"}
    def delete_case(self,case_id):
        self.repo.delete_case(case_id)
        self.db.commit()
        return {"message": "Case deleted successfully"}