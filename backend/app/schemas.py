from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


# ---------- Projects ----------
class ProjectCreate(BaseModel):
    template_id: int
    name: str
    description: Optional[str] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None
    status: str
    enterprise_name: Optional[str] = None
    rp_name: Optional[str] = None
    start_date: Optional[date] = None
    plan_end_date: Optional[date] = None
    progress: int = 0
    display_status: str = ""


# ---------- Templates ----------
class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TemplateTaskCreate(BaseModel):
    name: str                      # обязательно
    target_role: str               # обязательно
    description: Optional[str] = None
    duration_days: Optional[int] = None


class TemplateTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None
    target_role: str
    duration_days: int


class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None
    status: str
    task_count: int


# ---------- Enterprises ----------
class EnterpriseCreate(BaseModel):
    name: str
    region: Optional[str] = None


class EnterpriseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    region: Optional[str] = None
    users_count: int = 0


# ---------- Users ----------
class UserCreate(BaseModel):
    full_name: str
    email: str
    role: str
    department: Optional[str] = None
    enterprise_id: int


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    role: str
    department: Optional[str] = None
    enterprise_id: int
    enterprise_name: Optional[str] = None


# ---------- Tasks ----------
class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None
    status: str
    target_role: Optional[str] = None
    plan_start: Optional[date] = None
    plan_end: Optional[date] = None
    fact_end: Optional[date] = None
    assigned_user_id: Optional[int] = None
    assigned_user_name: Optional[str] = None
    project_id: int
    project_name: Optional[str] = None


class TaskAssign(BaseModel):
    assigned_user_id: int


class TaskStatusUpdate(BaseModel):
    status: str


class TaskCreate(BaseModel):
    name: str
    target_role: Optional[str] = None
    description: Optional[str] = None