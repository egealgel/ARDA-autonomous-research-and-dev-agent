from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.agents.claude import run_task
from app.db import get_db
from app.models import Task, TaskStatus, UsageLog
from app.schemas import TaskCreate, TaskRead, TaskUsage
from app.storage import new_artifact_key, storage

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _to_read(task: Task) -> TaskRead:
    usage = task.usage[0] if task.usage else None
    return TaskRead.model_validate(
        {
            "id": task.id,
            "prompt": task.prompt,
            "status": task.status,
            "agent": task.agent,
            "params": task.params,
            "result_text": task.result_text,
            "result_path": task.result_path,
            "error": task.error,
            "created_at": task.created_at,
            "completed_at": task.completed_at,
            "usage": TaskUsage(
                input_tokens=usage.input_tokens,
                output_tokens=usage.output_tokens,
                cache_creation_tokens=usage.cache_creation_tokens,
                cache_read_tokens=usage.cache_read_tokens,
                cost_usd=usage.cost_usd,
            )
            if usage
            else None,
        }
    )


@router.post("", response_model=TaskRead, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)) -> TaskRead:
    task = Task(prompt=payload.prompt, status=TaskStatus.running)
    db.add(task)
    db.commit()
    db.refresh(task)

    try:
        result = run_task(payload.prompt)
    except Exception as exc:
        task.status = TaskStatus.failed
        task.error = str(exc)
        task.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
        raise HTTPException(status_code=502, detail=f"Claude API error: {exc}") from exc

    artifact_key = new_artifact_key(task.id)
    path = storage.write_text(artifact_key, result.text)

    task.result_text = result.text
    task.result_path = path
    task.status = TaskStatus.succeeded
    task.completed_at = datetime.now(timezone.utc)

    db.add(
        UsageLog(
            task_id=task.id,
            model=result.model,
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            cache_creation_tokens=result.cache_creation_tokens,
            cache_read_tokens=result.cache_read_tokens,
            cost_usd=result.cost_usd,
            raw=result.raw,
        )
    )
    db.commit()

    task = db.scalars(
        select(Task).options(selectinload(Task.usage)).where(Task.id == task.id)
    ).one()
    return _to_read(task)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: str, db: Session = Depends(get_db)) -> TaskRead:
    task = db.scalars(
        select(Task).options(selectinload(Task.usage)).where(Task.id == task_id)
    ).one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _to_read(task)


@router.get("", response_model=list[TaskRead])
def list_tasks(db: Session = Depends(get_db), limit: int = 50) -> list[TaskRead]:
    tasks = db.scalars(
        select(Task)
        .options(selectinload(Task.usage))
        .order_by(Task.created_at.desc())
        .limit(limit)
    ).all()
    return [_to_read(t) for t in tasks]
