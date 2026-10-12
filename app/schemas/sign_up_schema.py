from pydantic import BaseModel, EmailStr,model_validator
from fastapi import  HTTPException
class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.confirm_password:
            raise HTTPException(status_code=422, detail="Passwords do not match")
        return self
        
        