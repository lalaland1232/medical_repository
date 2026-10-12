from app.database.db import Base
from sqlalchemy import Integer, Enum,LargeBinary,String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship,Mapped, mapped_column
from datetime import datetime
import enum

class Status(enum.Enum):
    DRAFT = "Draft"
    PLANNING = "Planning"
    IN_REVIEW = "In Review"
    APPROVED = "Approved"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class Priority(enum.Enum):
    high = 1
    medium = 2
    low = 3

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "med_schema"}
    user_id:Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name:Mapped[str] = mapped_column(String(500), nullable=False)
    email:Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    role_id:Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    

    
    artifact:Mapped['Artifact'] = relationship("Artifact", back_populates="user", cascade="all, delete-orphan")
    sessions:Mapped['Session'] = relationship("Session", back_populates="user", cascade="all, delete-orphan")


class Artifact(Base):
    __tablename__ = "artifacts"
    __table_args__ = {"schema": "med_schema"}
    artifact_id:Mapped[int]=mapped_column(Integer, ForeignKey("med_schema.users.user_id"), primary_key=True, index=True)
    artifact:Mapped[bytes]= mapped_column(LargeBinary, nullable=False)
    
    user:Mapped['User'] = relationship("User", back_populates="artifact")

class Session(Base):
    __tablename__="sessions"
    __table_args__ = {"schema": "med_schema"}
    session_id:Mapped[int]=mapped_column(Integer, primary_key=True, index=True)
    ip_address:Mapped[str]=mapped_column(String(500), nullable=True)
    device_name:Mapped[str]=mapped_column(String(500), nullable=True)
    user_id:Mapped[int]=mapped_column(Integer,ForeignKey("med_schema.users.user_id"), nullable=False)
    created_at:Mapped[datetime]=mapped_column(server_default=func.now() )
    hashed_token:Mapped[str]=mapped_column(String(500), nullable=False)
    revoked_at:Mapped[datetime | None]=mapped_column(DateTime, nullable=True)

    user:Mapped['User'] = relationship("User", back_populates="sessions")

class Role(Base):
        __tablename__ = "roles"
        __table_args__ = {"schema": "med_schema"}
        role_id:Mapped[int]=mapped_column(Integer, primary_key=True, index=True)
        role_name:Mapped[str]=mapped_column(String(50), nullable=False, unique=True)

class Permission(Base):
        __tablename__ = "permissions"
        __table_args__ = {"schema": "med_schema"}
        permission_id:Mapped[int]=mapped_column(Integer, primary_key=True, index=True)
        permission_name:Mapped[str]=mapped_column(String(50), nullable=False, unique=True)

class RolePermission(Base):
        __tablename__ = "role_permissions"
        __table_args__ = {"schema": "med_schema"}
        role_permission_id:Mapped[int]=mapped_column(Integer, primary_key=True, index=True)
        role_id:Mapped[int]=mapped_column(Integer, ForeignKey("med_schema.roles.role_id"), nullable=False)
        permission_id:Mapped[int]=mapped_column(Integer, ForeignKey("med_schema.permissions.permission_id"), nullable=False)

        Role:Mapped['Role'] = relationship("Role", backref="role_permissions")
        Permission:Mapped['Permission'] = relationship("Permission", backref="role_permissions")

class Case(Base):
    __tablename__ = "cases"
    __table_args__ = {"schema": "med_schema"}
    id:Mapped[int]=mapped_column(Integer, primary_key=True, index=True)
    case_id:Mapped[str]=mapped_column(String(50), nullable=False, unique=True,index=True)
    patient_refrence:Mapped[str]=mapped_column(String(50), nullable=False)
    surgeon_name:Mapped[str]=mapped_column(String(50), nullable=False)
    priority:Mapped[int]=mapped_column(Integer, default=Priority.low.value, nullable=False)
    created_by:Mapped[int]=mapped_column(Integer, ForeignKey("med_schema.users.user_id"), nullable=False)
    created_at:Mapped[datetime]=mapped_column(server_default=func.now())
    updated_at:Mapped[datetime]=mapped_column(server_default=func.now(), onupdate=func.now())
    status:Mapped[str]=mapped_column(String, default=Status.DRAFT.value, nullable=False)
    implant_type:Mapped[str]=mapped_column(String(50), nullable=True)
