from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app import models, schemas, crud
from app.database import get_db

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def get_current_user(db: Session = Depends(get_db),
                     x_user_id: int = Header(..., alias="X-User-Id")) -> models.User:
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user


@router.get("", response_model=list[schemas.ProjectOut])
def read_projects(
    status: Optional[str] = Query(None),
    enterprise_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == models.UserRole.RP:
        ent_id = current_user.enterprise_id
        projects = crud.get_projects(db, rp_id=current_user.id,
                                     enterprise_id=ent_id,
                                     status=status, search=search)
    elif current_user.role == models.UserRole.EXPERT_RCK:
        projects = crud.get_all_projects(db, status=status, search=search)
    else:
        raise HTTPException(status_code=403, detail="Нет доступа к проектам")

    return [crud.build_project_out(db, p) for p in projects]


@router.post("", response_model=schemas.ProjectOut, status_code=201)
def create_project(
    data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.RP:
        raise HTTPException(status_code=403, detail="Только РП может создавать проекты")

    project = crud.create_project_from_template(
        db,
        template_id=data.template_id,
        name=data.name,
        enterprise_id=current_user.enterprise_id,
        rp_id=current_user.id,
    )
    if not project:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return crud.build_project_out(db, project)