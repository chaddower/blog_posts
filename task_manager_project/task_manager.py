from task import Task
from database import Database
from typing import List

class TaskManager:
    def __init__(self, db: Database):
        self.db = db

    def add_task(self, title: str, description: str, due_date: str, priority: int) -> Task:
        task = Task(title, description, due_date, priority)
        self.db.insert_task(task)
        return task

    def get_all_tasks(self) -> List[Task]:
        return self.db.get_all_tasks()

    def get_task_by_id(self, task_id: int) -> Task:
        return self.db.get_task_by_id(task_id)

    def update_task(self, task: Task) -> None:
        self.db.update_task(task)

    def delete_task(self, task_id: int) -> None:
        self.db.delete_task(task_id)

    def get_tasks_by_priority(self, priority: int) -> List[Task]:
        return self.db.get_tasks_by_priority(priority)

    def get_tasks_by_due_date(self, due_date: str) -> List[Task]:
        return self.db.get_tasks_by_due_date(due_date)

    def mark_task_as_complete(self, task_id: int) -> None:
        task = self.get_task_by_id(task_id)
        task.mark_as_complete()
        self.update_task(task)

    def mark_task_as_incomplete(self, task_id: int) -> None:
        task = self.get_task_by_id(task_id)
        task.mark_as_incomplete()
        self.update_task(task)

    def get_completed_tasks(self) -> List[Task]:
        return self.db.get_completed_tasks()

    def get_incomplete_tasks(self) -> List[Task]:
        return self.db.get_incomplete_tasks()

    def search_tasks(self, keyword: str) -> List[Task]:
        return self.db.search_tasks(keyword)

    def get_overdue_tasks(self) -> List[Task]:
        return self.db.get_overdue_tasks()

    def get_upcoming_tasks(self, days: int) -> List[Task]:
        return self.db.get_upcoming_tasks(days)