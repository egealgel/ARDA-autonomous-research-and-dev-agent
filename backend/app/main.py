from fastapi import FastAPI

from app.routes import tasks, usage

app = FastAPI(title="Autonomous Research & Dev Agent", version="0.1.0")

app.include_router(tasks.router)
app.include_router(usage.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
