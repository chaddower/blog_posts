from datetime import datetime

class Task:
    def __init__(self, title: str, description: str, due_date: str, priority: int, task_id: int = None):
        self.task_id = task_id
        self.title = title
        self.description = description
        self.due_date = due_date
        self.priority = priority
        self.completed = False
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.updated_at = self.created_at

    def mark_as_complete(self):
        self.completed = True
        self.update_timestamp()

    def mark_as_incomplete(self):
        self.completed = False
        self.update_timestamp()

    def update_timestamp(self):
        self.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def update_details(self, title: str = None, description: str = None, due_date: str = None, priority: int = None):
        if title:
            self.title = title
        if description:
            self.description = description
        if due_date:
            self.due_date = due_date
        if priority is not None:
            self.priority = priority
        self.update_timestamp()

    def is_overdue(self):
        due_date = datetime.strptime(self.due_date, "%Y-%m-%d")
        return due_date < datetime.now() and not self.completed

    def days_until_due(self):
        due_date = datetime.strptime(self.due_date, "%Y-%m-%d")
        days = (due_date - datetime.now()).days
        return max(0, days)

    def __str__(self):
        status = "Completed" if self.completed else "Incomplete"
        return f"Task {self.task_id}: {self.title} (Due: {self.due_date}, Priority: {self.priority}, Status: {status})"

    def to_dict(self):
        return {
            "task_id": self.task_id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date,
            "priority": self.priority,
            "completed": self.completed,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data):
        task = cls(
            title=data["title"],
            description=data["description"],
            due_date=data["due_date"],
            priority=data["priority"],
            task_id=data["task_id"]
        )
        task.completed = data["completed"]
        task.created_at = data["created_at"]
        task.updated_at = data["updated_at"]
        return task