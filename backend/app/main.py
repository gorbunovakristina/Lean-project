from fastapi import FastAPI
from app.database import engine, Base
from app.routers import projects, templates, enterprises, users, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lean Project API",
    description="API для системы управления lean-проектами",
    version="1.0.0",
)

app.include_router(projects.router)
app.include_router(templates.router)
app.include_router(enterprises.router)
app.include_router(users.router)
app.include_router(tasks.router)


@app.get("/")
def read_root():
    return {"message": "Lean Project Backend is running!", "docs": "/docs"}