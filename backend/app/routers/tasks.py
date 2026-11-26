from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import get_db
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=list[schemas.TaskOut])
def read_my_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Экран «Мои задачи». Видит любой пользователь — только свои."""
    tasks = crud.get_my_tasks(db, current_user.id)
    return [crud.build_task_out(t) for t in tasks]


@router.get("/department", response_model=list[schemas.TaskOut])
def read_department_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Экран «Задачи отдела». Только для Начальника."""
    require_role(current_user, models.UserRole.DEPT_HEAD)
    tasks = crud.get_department_tasks(db, current_user)
    return [crud.build_task_out(t) for t in tasks]


@router.get("/{task_id}", response_model=schemas.TaskOut)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.ProjectTask).filter(models.ProjectTask.id == task_id).first()
    if not task:
        raise HTTPException(404, "Задача не найдена")
    # Доступ: владелец, РП проекта, начальник того же завода, РЦК (сводка)
    if not (task.assigned_user_id == current_user.id
            or task.project.rp_id == current_user.id
            or current_user.role == models.UserRole.EXPERT_RCK
            or (current_user.role == models.UserRole.DEPT_HEAD
                and current_user.enterprise_id == task.project.enterprise_id)):
        raise HTTPException(403, "Нет доступа к задаче")
    return crud.build_task_out(task)


@router.patch("/{task_id}/assign", response_model=schemas.TaskOut)
def assign_task(
    task_id: int,
    data: schemas.TaskAssign,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """РП назначает «красную» задачу; Начальник делегирует подчинённому."""
    require_role(current_user, models.UserRole.RP, models.UserRole.DEPT_HEAD)
    result = crud.assign_task(db, task_id, data.assigned_user_id)
    if result is None:
        raise HTTPException(404, "Задача не найдена")
    if result == "wrong_enterprise":
        raise HTTPException(400, "Сотрудник с другого завода")
    return crud.build_task_out(result)


@router.patch("/{task_id}/status", response_model=schemas.TaskOut)
def update_status(
    task_id: int,
    data: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = crud.update_task_status(db, task_id, data.status, current_user)
    if result is None:
        raise HTTPException(404, "Задача не найдена")
    if result == "not_yours":
        raise HTTPException(403, "Это не ваша задача")
    if result == "not_your_project":
        raise HTTPException(403, "Это не ваш проект")
    if result == "bad_transition":
        raise HTTPException(400, "Недопустимый переход статуса")
    if result == "forbidden":
        raise HTTPException(403, "Нет прав менять статус")
    return crud.build_task_out(result)