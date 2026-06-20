from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import plan, research, tasks, usage

app = FastAPI(title="Autonomous Research & Dev Agent", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(usage.router)
app.include_router(research.router)
app.include_router(plan.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
