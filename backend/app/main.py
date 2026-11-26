from fastapi import FastAPI
from app.database import engine, Base

# Создаем таблицы в SQLite при запуске (только для MVP, в проде используют миграции Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lean Project API",
    description="API для системы управления lean-проектами",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Lean Project Backend is running!", "docs": "/docs"}

# Здесь позже мы подключим роутеры:
# from app.routers import users, projects
# app.include_router(users.router, prefix="/api/users", tags=["Users"])
# app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])