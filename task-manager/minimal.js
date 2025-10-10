// Minimal Task Manager

let tasks = [];

function addTask(text) {
  tasks.push({ id: Date.now(), text, completed: false });
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
}

function toggleTask(id) {
  const task = tasks.find(task => task.id === id);
  if (task) {
    task.completed = !task.completed;
  }
}

function renderTasks() {
  console.log(tasks);
}

// Example usage
addTask("Buy groceries");
addTask("Walk the dog");
renderTasks();
toggleTask(tasks[0].id);
renderTasks();
deleteTask(tasks[1].id);
renderTasks();