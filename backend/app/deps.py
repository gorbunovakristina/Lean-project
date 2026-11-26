from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app import models
from app.database import get_db


def get_current_user(
    db: Session = Depends(get_db),
    x_user_id: int = Header(..., alias="X-User-Id"),
) -> models.User:
    """ВРЕМЕННО для разработки. Позже заменим на JWT, логика ролей останется."""
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user


def require_role(user: models.User, *allowed: models.UserRole):
    if user.role not in allowed:
        raise HTTPException(status_code=403, detail="Нет доступа к этому действию")