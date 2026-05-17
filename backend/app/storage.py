import uuid
from pathlib import Path
from typing import Protocol

from app.config import settings


class Storage(Protocol):
    def write_text(self, key: str, content: str) -> str: ...
    def read_text(self, key: str) -> str: ...


class LocalStorage:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        p = (self.root / key).resolve()
        if not str(p).startswith(str(self.root)):
            raise ValueError(f"key escapes storage root: {key}")
        p.parent.mkdir(parents=True, exist_ok=True)
        return p

    def write_text(self, key: str, content: str) -> str:
        p = self._path(key)
        p.write_text(content, encoding="utf-8")
        return str(p)

    def read_text(self, key: str) -> str:
        return self._path(key).read_text(encoding="utf-8")


def new_artifact_key(task_id: uuid.UUID, suffix: str = ".md") -> str:
    return f"tasks/{task_id}/result{suffix}"


storage: Storage = LocalStorage(settings.storage_path)
