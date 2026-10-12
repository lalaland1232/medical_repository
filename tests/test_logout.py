from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_logout_flow():
    # Login as admin
    login_res = client.post(
        "/login",
        json={"email": "shiv@gmail.com", "password": "password123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.json()["access_token"]
    refresh_token = login_res.json()["refresh_token"]

    # Logout with access token
    logout_res = client.post(
        "/logout",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert logout_res.status_code == 200
    assert logout_res.json() == {"message": "Logged out successfully"}

    # Attempting refresh after logout should fail because the session was marked revoked
    refresh_res = client.post(
        "/refresh_token",
        headers={"Authorization": f"Bearer {refresh_token}"}
    )
    assert refresh_res.status_code == 401
    assert "revoked" in refresh_res.json()["detail"].lower()
