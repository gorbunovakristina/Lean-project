from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    EXPERT_RCK = "Эксперт РЦК"
    ADMIN = "Администратор"
    RP = "РП"
    DEPT_HEAD = "Начальник отдела"
    EMPLOYEE = "Сотрудник"


class ProjectStatus(str, enum.Enum):
    DRAFT = "Черновик"
    IN_PROGRESS = "В работе"
    COMPLETED = "Завершен"


class TaskStatus(str, enum.Enum):
    UNASSIGNED = "Не назначено"
    NOT_STARTED = "Не начато"
    IN_PROGRESS = "В работе"
    UNDER_REVIEW = "На проверке"
    DONE = "Выполнено"


class Enterprise(Base):
    __tablename__ = "enterprises"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    region = Column(String)
    users = relationship("User", back_populates="enterprise")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(Enum(UserRole))
    department = Column(String, nullable=True)
    enterprise_id = Column(Integer, ForeignKey("enterprises.id"))
    enterprise = relationship("Enterprise", back_populates="users")


class Template(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    status = Column(String, default="Черновик")
    creator_id = Column(Integer, ForeignKey("users.id"))
    tasks = relationship("TemplateTask", back_populates="template", cascade="all, delete-orphan")


class TemplateTask(Base):
    __tablename__ = "template_tasks"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"))
    name = Column(String)
    description = Column(String, nullable=True)
    target_role = Column(String)
    duration_days = Column(Integer, default=1)
    template = relationship("Template", back_populates="tasks")


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"))
    name = Column(String)
    enterprise_id = Column(Integer, ForeignKey("enterprises.id"))
    rp_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    start_date = Column(Date, nullable=True)
    plan_end_date = Column(Date, nullable=True)
    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")
    enterprise = relationship("Enterprise")
    rp = relationship("User", foreign_keys=[rp_id])


class ProjectTask(Base):
    __tablename__ = "project_tasks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    description = Column(String, nullable=True)
    target_role = Column(String)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    plan_start = Column(Date, nullable=True)
    plan_end = Column(Date, nullable=True)
    fact_end = Column(Date, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.UNASSIGNED)
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", foreign_keys=[assigned_user_id])