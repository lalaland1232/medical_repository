from pydantic import BaseModel,field_validator
from app.models.models import Priority,Status

class CreateCaseRequest(BaseModel):
    case_id:str
    patient_refrence:str
    surgeon_name:str
    priority:Priority
    status:Status
    created_by:int
    implant_type:str

    @field_validator('priority',mode='before')
    @classmethod
    def validate_priority(cls, value):
        if isinstance(value, str):
            try:
                return Priority[value.strip().lower()]
            except KeyError:
                raise ValueError(f"Invalid priority value:{value} it must be one of {[p.name for p in Priority]}")
        return value

class UpdateCaseRequest(BaseModel):
    status:Status