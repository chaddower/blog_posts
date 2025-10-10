import tkinter as tk
from tkinter import messagebox
from task import Task
from task_list import TaskList
from database import Database

class TaskManagerApp:
    def __init__(self, master):
        self.master = master
        self.master.title("Task Manager")
        self.master.geometry("400x300")

        self.db = Database("tasks.db")
        self.task_list = TaskList(self.db)

        self.create_widgets()

    def create_widgets(self):
        # Task input
        self.task_input = tk.Entry(self.master, width=40)
        self.task_input.pack(pady=10)

        # Add task button
        add_button = tk.Button(self.master, text="Add Task", command=self.add_task)
        add_button.pack()

        # Task listbox
        self.task_listbox = tk.Listbox(self.master, width=50)
        self.task_listbox.pack(pady=10)

        # Complete task button
        complete_button = tk.Button(self.master, text="Complete Task", command=self.complete_task)
        complete_button.pack()

        # Delete task button
        delete_button = tk.Button(self.master, text="Delete Task", command=self.delete_task)
        delete_button.pack()

        self.update_task_list()

    def add_task(self):
        task_description = self.task_input.get()
        if task_description:
            new_task = Task(description=task_description)
            self.task_list.add_task(new_task)
            self.task_input.delete(0, tk.END)
            self.update_task_list()
        else:
            messagebox.showwarning("Invalid Input", "Please enter a task description.")

    def complete_task(self):
        selected_indices = self.task_listbox.curselection()
        if selected_indices:
            task_index = selected_indices[0]
            task = self.task_list.get_task(task_index)
            task.complete()
            self.task_list.update_task(task)
            self.update_task_list()
        else:
            messagebox.showwarning("No Task Selected", "Please select a task to complete.")

    def delete_task(self):
        selected_indices = self.task_listbox.curselection()
        if selected_indices:
            task_index = selected_indices[0]
            self.task_list.remove_task(task_index)
            self.update_task_list()
        else:
            messagebox.showwarning("No Task Selected", "Please select a task to delete.")

    def update_task_list(self):
        self.task_listbox.delete(0, tk.END)
        for task in self.task_list.get_all_tasks():
            status = "✓" if task.completed else " "
            self.task_listbox.insert(tk.END, f"[{status}] {task.description}")

if __name__ == "__main__":
    root = tk.Tk()
    app = TaskManagerApp(root)
    root.mainloop()