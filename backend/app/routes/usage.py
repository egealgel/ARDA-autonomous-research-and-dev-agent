from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.models import UsageLog

router = APIRouter(prefix="/usage", tags=["usage"])


class MonthlyUsage(BaseModel):
    month: str
    total_cost_usd: float
    budget_usd: float
    budget_remaining_usd: float
    total_input_tokens: int
    total_output_tokens: int
    request_count: int


@router.get("/current-month", response_model=MonthlyUsage)
def current_month_usage(db: Session = Depends(get_db)) -> MonthlyUsage:
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    row = db.execute(
        select(
            func.coalesce(func.sum(UsageLog.cost_usd), 0.0),
            func.coalesce(func.sum(UsageLog.input_tokens), 0),
            func.coalesce(func.sum(UsageLog.output_tokens), 0),
            func.count(UsageLog.id),
        ).where(UsageLog.created_at >= month_start)
    ).one()

    total_cost, input_tokens, output_tokens, count = row
    return MonthlyUsage(
        month=month_start.strftime("%Y-%m"),
        total_cost_usd=float(total_cost),
        budget_usd=settings.monthly_budget_usd,
        budget_remaining_usd=settings.monthly_budget_usd - float(total_cost),
        total_input_tokens=int(input_tokens),
        total_output_tokens=int(output_tokens),
        request_count=int(count),
    )
