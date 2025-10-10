import tkinter as tk
from tkinter import ttk, messagebox
from task_manager import TaskManager
from task import Task
from database import Database
from ui_components import TaskListFrame, AddTaskFrame

class TaskManagerApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Task Manager")
        self.geometry("800x600")

        self.db = Database("tasks.db")
        self.task_manager = TaskManager(self.db)

        self.create_widgets()

    def create_widgets(self):
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(expand=True, fill="both")

        self.task_list_frame = TaskListFrame(self.notebook, self.task_manager)
        self.add_task_frame = AddTaskFrame(self.notebook, self.task_manager)

        self.notebook.add(self.task_list_frame, text="Task List")
        self.notebook.add(self.add_task_frame, text="Add Task")

    def run(self):
        self.mainloop()

if __name__ == "__main__":
    app = TaskManagerApp()
    app.run()