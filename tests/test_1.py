from fastapi.testclient import TestClient
from main import app
from app.security.security import get_current_user
from app.database.db import get_db
from app.models.models import Session
db=next(get_db())
client = TestClient(app)

def test_sign_up():
    
    login_response = client.post(
            "/login",
            json={"email": "shiv@gmail.com","password": "password123"})
   
    assert login_response.status_code == 200
    
  
    
  