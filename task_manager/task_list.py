from task import Task

class TaskList:
    def __init__(self, database):
        self.database = database
        self.tasks = self.load_tasks()

    def load_tasks(self):
        task_dicts = self.database.get_all_tasks()
        return [Task.from_dict(task_dict) for task_dict in task_dicts]

    def add_task(self, task):
        self.tasks.append(task)
        self.database.add_task(task.to_dict())

    def remove_task(self, index):
        task = self.tasks.pop(index)
        self.database.delete_task(task.task_id)

    def get_task(self, index):
        return self.tasks[index]

    def update_task(self, task):
        index = self.tasks.index(task)
        self.tasks[index] = task
        self.database.update_task(task.to_dict())

    def get_all_tasks(self):
        return self.tasks

    def get_completed_tasks(self):
        return [task for task in self.tasks if task.completed]

    def get_incomplete_tasks(self):
        return [task for task in self.tasks if not task.completed]

    def clear_completed_tasks(self):
        completed_tasks = self.get_completed_tasks()
        for task in completed_tasks:
            self.tasks.remove(task)
            self.database.delete_task(task.task_id)

    def sort_tasks_by_creation_date(self, reverse=False):
        self.tasks.sort(key=lambda x: x.created_at, reverse=reverse)

    def sort_tasks_by_completion_date(self, reverse=False):
        completed_tasks = [task for task in self.tasks if task.completed]
        incomplete_tasks = [task for task in self.tasks if not task.completed]
        
        completed_tasks.sort(key=lambda x: x.completed_at, reverse=reverse)
        self.tasks = completed_tasks + incomplete_tasks if reverse else incomplete_tasks + completed_tasks

    def filter_tasks_by_keyword(self, keyword):
        return [task for task in self.tasks if keyword.lower() in task.description.lower()]

    def get_overdue_tasks(self, days_limit):
        return [task for task in self.tasks if task.is_overdue(days_limit)]

    def get_tasks_stats(self):
        total_tasks = len(self.tasks)
        completed_tasks = len(self.get_completed_tasks())
        incomplete_tasks = total_tasks - completed_tasks
        completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "incomplete_tasks": incomplete_tasks,
            "completion_rate": completion_rate
        }

    def export_tasks_to_csv(self, filename):
        import csv
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ['task_id', 'description', 'completed', 'created_at', 'completed_at']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for task in self.tasks:
                writer.writerow(task.to_dict())

    def import_tasks_from_csv(self, filename):
        import csv
        with open(filename, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                task = Task.from_dict(row)
                self.add_task(task)