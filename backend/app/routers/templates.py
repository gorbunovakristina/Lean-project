from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app import models, schemas, crud
from app.database import get_db
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/api/templates", tags=["Templates"])


@router.get("", response_model=list[schemas.TemplateOut])
def read_templates(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # РЦК видит всё (вкл. черновики), РП — только опубликованные (модальное окно выбора)
    if current_user.role == models.UserRole.EXPERT_RCK:
        tpl = crud.get_templates(db, status=status, search=search)
    elif current_user.role == models.UserRole.RP:
        tpl = crud.get_templates(db, only_published=True, search=search)
    else:
        raise HTTPException(403, "Нет доступа к шаблонам")
    return [crud.build_template_out(t) for t in tpl]


@router.post("", response_model=schemas.TemplateOut, status_code=201)
def create_template(
    data: schemas.TemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.EXPERT_RCK)
    tpl = crud.create_template(db, data, current_user.id)
    return crud.build_template_out(tpl)


@router.get("/{template_id}", response_model=schemas.TemplateOut)
def read_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tpl = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not tpl:
        raise HTTPException(404, "Шаблон не найден")
    if current_user.role == models.UserRole.RP and tpl.status != "Опубликован":
        raise HTTPException(403, "Черновик доступен только РЦК")
    require_role(current_user, models.UserRole.EXPERT_RCK, models.UserRole.RP)
    return crud.build_template_out(tpl)


@router.get("/{template_id}/tasks", response_model=list[schemas.TemplateTaskOut])
def read_template_tasks(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.EXPERT_RCK, models.UserRole.RP)
    tpl = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not tpl:
        raise HTTPException(404, "Шаблон не найден")
    return tpl.tasks


@router.post("/{template_id}/tasks", response_model=schemas.TemplateTaskOut, status_code=201)
def add_template_task(
    template_id: int,
    data: schemas.TemplateTaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.EXPERT_RCK)
    tpl = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not tpl:
        raise HTTPException(404, "Шаблон не найден")
    return crud.add_template_task(db, template_id, data)


@router.patch("/{template_id}/publish", response_model=schemas.TemplateOut)
def publish_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    require_role(current_user, models.UserRole.EXPERT_RCK)
    tpl = crud.publish_template(db, template_id)
    if not tpl:
        raise HTTPException(404, "Шаблон не найден")
    return crud.build_template_out(tpl)