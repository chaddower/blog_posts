document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                <div>
                    <button onclick="toggleTask(${index})">Toggle</button>
                    <button onclick="deleteTask(${index})">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text, completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    }

    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    addTaskButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    window.toggleTask = toggleTask;
    window.deleteTask = deleteTask;

    renderTasks();
});

// Add these lines to make the functions accessible globally
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Helper function to generate unique IDs for tasks
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Function to filter tasks
function filterTasks(filter) {
    switch (filter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Function to clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Add event listeners for filter buttons
document.getElementById('filterAll').addEventListener('click', () => renderTasks(filterTasks('all')));
document.getElementById('filterActive').addEventListener('click', () => renderTasks(filterTasks('active')));
document.getElementById('filterCompleted').addEventListener('click', () => renderTasks(filterTasks('completed')));
document.getElementById('clearCompleted').addEventListener('click', clearCompleted);

// Update renderTasks function to accept filtered tasks
function renderTasks(filteredTasks = tasks) {
    taskList.innerHTML = '';
    filteredTasks.forEach((task, index) => {
        // ... (rest of the renderTasks function)
    });
}