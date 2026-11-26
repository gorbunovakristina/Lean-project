from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app import models, schemas, crud
from app.database import get_db
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/api/enterprises", tags=["Enterprises"])


@router.get("", response_model=list[schemas.EnterpriseOut])
def read_enterprises(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == models.UserRole.RP:
        ents = crud.get_enterprises(db, current_user.enterprise_id)
    elif current_user.role in (models.UserRole.ADMIN, models.UserRole.EXPERT_RCK):
        ents = crud.get_enterprises(db)
    else:
        raise HTTPException(403, "Нет доступа")
    return [crud.build_enterprise_out(db, e) for e in ents]


@router.post("", response_model=schemas.EnterpriseOut, status_code=201)
def create_enterprise(
    data: schemas.EnterpriseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.ADMIN)
    return crud.build_enterprise_out(db, crud.create_enterprise(db, data))


@router.get("/{enterprise_id}/departments", response_model=list[str])
def read_departments(
    enterprise_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.ADMIN, models.UserRole.EXPERT_RCK)
    return crud.get_departments(db, enterprise_id)


@router.get("/{enterprise_id}/users", response_model=list[schemas.UserOut])
def read_enterprise_users(
    enterprise_id: int,
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Начальник видит только свой отдел, РП — весь свой завод
    if current_user.role == models.UserRole.DEPT_HEAD:
        if enterprise_id != current_user.enterprise_id:
            raise HTTPException(403, "Чужой завод")
        department = current_user.department
    elif current_user.role == models.UserRole.RP:
        if enterprise_id != current_user.enterprise_id:
            raise HTTPException(403, "Чужой завод")
    elif current_user.role not in (models.UserRole.ADMIN, models.UserRole.EXPERT_RCK):
        raise HTTPException(403, "Нет доступа")

    users = crud.get_users(db, enterprise_id=enterprise_id, department=department)
    return [crud.build_user_out(u) for u in users]