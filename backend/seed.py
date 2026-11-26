from app.database import SessionLocal, engine, Base
from app import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

ent = models.Enterprise(name="ООО «Завод №1»", region="Москва")
db.add(ent); db.flush()

rc  = models.User(full_name="Эксперт ЦК", email="rck@test.ru", role=models.UserRole.EXPERT_RCK)
adm = models.User(full_name="Админ", email="adm@test.ru", role=models.UserRole.ADMIN)
rp  = models.User(full_name="Иванов И.И.", email="rp@test.ru", role=models.UserRole.RP, enterprise_id=ent.id)
head= models.User(full_name="Петров П.П.", email="head@test.ru", role=models.UserRole.DEPT_HEAD,
                  department="Цех №1", enterprise_id=ent.id)
emp = models.User(full_name="Сидоров С.С.", email="emp@test.ru", role=models.UserRole.EMPLOYEE,
                  department="Цех №1", enterprise_id=ent.id)
db.add_all([rc, adm, rp, head, emp]); db.flush()

tpl1 = models.Template(name="Стандарт внедрения 5S", description="Контекстный шаблон",
                       status="Опубликован", creator_id=rc.id)
db.add(tpl1); db.flush()
db.add(models.TemplateTask(template_id=tpl1.id, name="Проведение аудит текущего состояния",
                           target_role="Начальник отдела", duration_days=5))
db.add(models.TemplateTask(template_id=tpl1.id, name="Маркировка",
                           target_role="Сотрудник", duration_days=3))

tpl2 = models.Template(name="Диагностика производства", description="Оценка состояния",
                       status="Черновик", creator_id=rc.id)
db.add(tpl2)

db.commit()
print("Seed ok. Завод=1 | РЦК=1, Админ=2, РП=3, Нач=4, Сотр=5 | Шаблон опубл=1, чернов=2")
db.close()