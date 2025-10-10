const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const tasksFile = path.join(__dirname, 'tasks.json');

// Helper function to read tasks from file
function readTasks() {
    if (fs.existsSync(tasksFile)) {
        const data = fs.readFileSync(tasksFile, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Helper function to write tasks to file
function writeTasks(tasks) {
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
}

// Get all tasks
app.get('/api/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

// Add a new task
app.post('/api/tasks', (req, res) => {
    const tasks = readTasks();
    const newTask = {
        id: Date.now().toString(),
        text: req.body.text,
        completed: false
    };
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === req.params.id);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    let tasks = readTasks();
    tasks = tasks.filter(task => task.id !== req.params.id);
    writeTasks(tasks);
    res.status(204).end();
});

// Serve the main application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server.');
    app.close(() => {
        console.log('HTTP server closed.');
    });
});