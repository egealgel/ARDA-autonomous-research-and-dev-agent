import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    prompt: str = Field(min_length=1, max_length=10_000)


class TaskUsage(BaseModel):
    input_tokens: int
    output_tokens: int
    cache_creation_tokens: int
    cache_read_tokens: int
    cost_usd: float


class TaskRead(BaseModel):
    id: uuid.UUID
    prompt: str
    status: str
    agent: str | None = None
    params: dict | None = None
    result_text: str | None
    result_path: str | None
    error: str | None
    created_at: datetime
    completed_at: datetime | None
    usage: TaskUsage | None = None

    model_config = {"from_attributes": True}
