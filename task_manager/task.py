import uuid
from datetime import datetime

class Task:
    def __init__(self, description, completed=False, created_at=None, completed_at=None, task_id=None):
        self.task_id = task_id or str(uuid.uuid4())
        self.description = description
        self.completed = completed
        self.created_at = created_at or datetime.now()
        self.completed_at = completed_at

    def complete(self):
        if not self.completed:
            self.completed = True
            self.completed_at = datetime.now()

    def uncomplete(self):
        if self.completed:
            self.completed = False
            self.completed_at = None

    def update_description(self, new_description):
        self.description = new_description

    def to_dict(self):
        return {
            "task_id": self.task_id,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }

    @classmethod
    def from_dict(cls, task_dict):
        return cls(
            description=task_dict["description"],
            completed=task_dict["completed"],
            created_at=datetime.fromisoformat(task_dict["created_at"]),
            completed_at=datetime.fromisoformat(task_dict["completed_at"]) if task_dict["completed_at"] else None,
            task_id=task_dict["task_id"]
        )

    def __str__(self):
        status = "Completed" if self.completed else "Not completed"
        return f"Task: {self.description} ({status})"

    def __repr__(self):
        return f"Task('{self.description}', completed={self.completed}, created_at={self.created_at}, completed_at={self.completed_at}, task_id='{self.task_id}')"

    def __eq__(self, other):
        if not isinstance(other, Task):
            return False
        return self.task_id == other.task_id

    def __hash__(self):
        return hash(self.task_id)

    def days_since_creation(self):
        return (datetime.now() - self.created_at).days

    def days_to_complete(self):
        if not self.completed:
            return None
        return (self.completed_at - self.created_at).days

    def is_overdue(self, days_limit):
        if self.completed:
            return False
        return self.days_since_creation() > days_limit