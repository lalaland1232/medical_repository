from app.models.models import Artifact,User,Permission,RolePermission
from sqlalchemy import select

def store_artifact(db,hashed_password,user_id):
    artifact=Artifact(
        artifact_id=user_id,
        artifact=hashed_password
    )
    db.add(artifact)

def get_artifact(user_id,db):
    artifact = db.query(Artifact).filter(Artifact.artifact_id == user_id).first()
    if artifact:
        return artifact.artifact
    else:
        return None

def get_user(db,user_id):
    user = db.query(User).filter(User.user_id == user_id).first()
    return user

def find_permission(db,permission,role_id):
    stmt = select(RolePermission).where(RolePermission.role_id==role_id ,RolePermission.permission_id == select(Permission.permission_id).where(Permission.permission_name==permission).scalar_subquery())
    return db.execute(stmt).first()