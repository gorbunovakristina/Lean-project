from sqlalchemy.orm import Session
from sqlalchemy import distinct
from datetime import date, timedelta
from app import models, schemas


# ================= PROJECTS =================
def get_projects(db: Session, enterprise_id: int, status: str = None, search: str = None):
    query = db.query(models.Project).filter(models.Project.enterprise_id == enterprise_id)
    if status:
        query = query.filter(models.Project.status == status)
    if search:
        query = query.filter(models.Project.name.ilike(f"%{search}%"))
    return query.all()


def get_all_projects(db: Session, status: str = None, search: str = None):
    query = db.query(models.Project)
    if status:
        query = query.filter(models.Project.status == status)
    if search:
        query = query.filter(models.Project.name.ilike(f"%{search}%"))
    return query.all()


def create_project_from_template(db: Session, template_id: int, name: str,
                                 enterprise_id: int, rp_id: int):
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not template:
        return None

    project = models.Project(
        template_id=template_id, name=name, enterprise_id=enterprise_id,
        rp_id=rp_id, status=models.ProjectStatus.DRAFT, start_date=date.today(),
    )
    db.add(project)
    db.flush()

    users = db.query(models.User).filter(models.User.enterprise_id == enterprise_id).all()
    for t_task in template.tasks:
        assigned = None
        for u in users:
            if u.role.value == t_task.target_role:
                assigned = u.id
                break
        db.add(models.ProjectTask(
            project_id=project.id, name=t_task.name, description=t_task.description,
            target_role=t_task.target_role, assigned_user_id=assigned,
            plan_start=date.today(),
            plan_end=date.today() + timedelta(days=t_task.duration_days or 1),
            status=models.TaskStatus.UNASSIGNED if assigned is None
                   else models.TaskStatus.NOT_STARTED,
        ))
    db.commit()
    db.refresh(project)
    return project


def build_project_out(db: Session, project: models.Project) -> schemas.ProjectOut:
    tasks = db.query(models.ProjectTask).filter(models.ProjectTask.project_id == project.id).all()
    done = sum(1 for t in tasks if t.status == models.TaskStatus.DONE)
    progress = int((done / len(tasks)) * 100) if tasks else 0
    display_status = project.status.value
    if (project.plan_end_date and project.plan_end_date < date.today()
            and project.status != models.ProjectStatus.COMPLETED):
        display_status = "Просрочен"
    return schemas.ProjectOut(
        id=project.id, name=project.name, description=project.name,
        status=project.status.value,
        enterprise_name=project.enterprise.name if project.enterprise else None,
        rp_name=project.rp.full_name if project.rp else None,
        start_date=project.start_date, plan_end_date=project.plan_end_date,
        progress=progress, display_status=display_status,
    )


# ================= TEMPLATES =================
def get_templates(db: Session, only_published: bool = False,
                  status: str = None, search: str = None):
    query = db.query(models.Template)
    if only_published:
        query = query.filter(models.Template.status == "Опубликован")
    elif status:
        query = query.filter(models.Template.status == status)
    if search:
        query = query.filter(models.Template.name.ilike(f"%{search}%"))
    return query.all()


def build_template_out(template: models.Template) -> schemas.TemplateOut:
    return schemas.TemplateOut(
        id=template.id, name=template.name, description=template.description,
        status=template.status, task_count=len(template.tasks),
    )


def create_template(db: Session, data: schemas.TemplateCreate, creator_id: int):
    tpl = models.Template(name=data.name, description=data.description,
                          status="Черновик", creator_id=creator_id)
    db.add(tpl); db.commit(); db.refresh(tpl)
    return tpl


def add_template_task(db: Session, template_id: int, data: schemas.TemplateTaskCreate):
    task = models.TemplateTask(
        template_id=template_id, name=data.name, description=data.description,
        target_role=data.target_role, duration_days=data.duration_days or 1,
    )
    db.add(task); db.commit(); db.refresh(task)
    return task


def publish_template(db: Session, template_id: int):
    tpl = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not tpl:
        return None
    tpl.status = "Опубликован"
    db.commit(); db.refresh(tpl)
    return tpl


# ================= ENTERPRISES =================
def get_enterprises(db: Session, enterprise_id: int = None):
    query = db.query(models.Enterprise)
    if enterprise_id:
        query = query.filter(models.Enterprise.id == enterprise_id)
    return query.all()


def build_enterprise_out(db: Session, ent: models.Enterprise) -> schemas.EnterpriseOut:
    count = db.query(models.User).filter(models.User.enterprise_id == ent.id).count()
    return schemas.EnterpriseOut(id=ent.id, name=ent.name, region=ent.region, users_count=count)


def create_enterprise(db: Session, data: schemas.EnterpriseCreate):
    ent = models.Enterprise(name=data.name, region=data.region)
    db.add(ent); db.commit(); db.refresh(ent)
    return ent


def get_departments(db: Session, enterprise_id: int):
    rows = db.query(distinct(models.User.department)).filter(
        models.User.enterprise_id == enterprise_id,
        models.User.department.isnot(None),
    ).all()
    return [r[0] for r in rows]


# ================= USERS =================
def get_users(db: Session, enterprise_id: int = None, department: str = None):
    query = db.query(models.User)
    if enterprise_id:
        query = query.filter(models.User.enterprise_id == enterprise_id)
    if department:
        query = query.filter(models.User.department == department)
    return query.all()


def build_user_out(user: models.User) -> schemas.UserOut:
    return schemas.UserOut(
        id=user.id, full_name=user.full_name, email=user.email,
        role=user.role.value, department=user.department,
        enterprise_id=user.enterprise_id,
        enterprise_name=user.enterprise.name if user.enterprise else None,
    )


def create_user(db: Session, data: schemas.UserCreate):
    user = models.User(
        full_name=data.full_name, email=data.email,
        role=models.UserRole(data.role), department=data.department,
        enterprise_id=data.enterprise_id,
    )
    db.add(user); db.commit(); db.refresh(user)
    return user


# ================= TASKS =================
def get_my_tasks(db: Session, user_id: int):
    return db.query(models.ProjectTask).filter(
        models.ProjectTask.assigned_user_id == user_id
    ).all()


def get_department_tasks(db: Session, user: models.User):
    sub = db.query(models.User.id).filter(
        models.User.enterprise_id == user.enterprise_id,
        models.User.department == user.department,
    ).subquery()
    return db.query(models.ProjectTask).filter(
        (models.ProjectTask.assigned_user_id == user.id)
        | (models.ProjectTask.assigned_user_id.is_(None)
           & (models.ProjectTask.target_role == user.role.value))
        | (models.ProjectTask.assigned_user_id.in_(sub))
    ).all()


def build_task_out(task: models.ProjectTask) -> schemas.TaskOut:
    return schemas.TaskOut(
        id=task.id, name=task.name, description=task.description,
        status=task.status.value, target_role=task.target_role,
        plan_start=task.plan_start, plan_end=task.plan_end, fact_end=task.fact_end,
        assigned_user_id=task.assigned_user_id,
        assigned_user_name=task.assigned_user.full_name if task.assigned_user else None,
        project_id=task.project_id,
        project_name=task.project.name if task.project else None,
    )


def assign_task(db: Session, task_id: int, user_id: int):
    task = db.query(models.ProjectTask).filter(models.ProjectTask.id == task_id).first()
    if not task:
        return None
    assignee = db.query(models.User).filter(models.User.id == user_id).first()
    if not assignee or assignee.enterprise_id != task.project.enterprise_id:
        return "wrong_enterprise"
    task.assigned_user_id = user_id
    if task.status == models.TaskStatus.UNASSIGNED:
        task.status = models.TaskStatus.NOT_STARTED
    db.commit(); db.refresh(task)
    return task


def update_task_status(db: Session, task_id: int, new_status: str, user: models.User):
    task = db.query(models.ProjectTask).filter(models.ProjectTask.id == task_id).first()
    if not task:
        return None
    ns = models.TaskStatus(new_status)

    # Сотрудник/начальник двигают свою задачу по цепочке
    if user.role in (models.UserRole.EMPLOYEE, models.UserRole.DEPT_HEAD):
        if task.assigned_user_id != user.id:
            return "not_yours"
        allowed = {
            models.TaskStatus.NOT_STARTED: models.TaskStatus.IN_PROGRESS,
            models.TaskStatus.IN_PROGRESS: models.TaskStatus.UNDER_REVIEW,
        }
        if allowed.get(task.status) != ns:
            return "bad_transition"
    # РП/начальник проверяют и ставят Выполнено
    elif user.role == models.UserRole.RP:
        if task.project.rp_id != user.id:
            return "not_your_project"
        if ns != models.TaskStatus.DONE or task.status != models.TaskStatus.UNDER_REVIEW:
            return "bad_transition"
    elif user.role == models.UserRole.DEPT_HEAD:
        if ns != models.TaskStatus.DONE or task.status != models.TaskStatus.UNDER_REVIEW:
            return "bad_transition"
    else:
        return "forbidden"

    task.status = ns
    if ns == models.TaskStatus.DONE:
        task.fact_end = date.today()
    db.commit(); db.refresh(task)
    return task


def create_manual_task(db: Session, project_id: int, data: schemas.TaskCreate):
    task = models.ProjectTask(
        project_id=project_id, name=data.name, description=data.description,
        target_role=data.target_role, status=models.TaskStatus.UNASSIGNED,
        plan_start=date.today(), plan_end=date.today() + timedelta(days=1),
    )
    db.add(task); db.commit(); db.refresh(task)
    return task