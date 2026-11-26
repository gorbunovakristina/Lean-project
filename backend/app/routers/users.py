from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import get_db
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", response_model=list[schemas.UserOut])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.ADMIN, models.UserRole.EXPERT_RCK)
    return [crud.build_user_out(u) for u in crud.get_users(db)]


@router.post("", response_model=schemas.UserOut, status_code=201)
def create_user(
    data: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.ADMIN)
    try:
        user = crud.create_user(db, data)
    except ValueError:
        raise HTTPException(400, "Некорректная роль")
    return crud.build_user_out(user)


@router.get("/roles", response_model=list[str])
def read_roles():
    """Справочник ролей для выпадающих списков фронта."""
    return [r.value for r in models.UserRole]