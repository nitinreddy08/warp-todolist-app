const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const TODOS_FILE = path.join(__dirname, 'todos.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize todos file if it doesn't exist
if (!fs.existsSync(TODOS_FILE)) {
    fs.writeFileSync(TODOS_FILE, JSON.stringify([]));
}

// Helper function to read todos from file
function readTodos() {
    try {
        const data = fs.readFileSync(TODOS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write todos to file
function writeTodos(todos) {
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
}

// Routes
// Get all todos
app.get('/api/todos', (req, res) => {
    const todos = readTodos();
    res.json(todos);
});

// Add new todo
app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Todo text is required' });
    }
    
    const todos = readTodos();
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    writeTodos(todos);
    res.status(201).json(newTodo);
});

// Update todo (toggle completion or edit text)
app.put('/api/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    const { text, completed } = req.body;
    
    const todos = readTodos();
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    if (text !== undefined) {
        todos[todoIndex].text = text;
    }
    if (completed !== undefined) {
        todos[todoIndex].completed = completed;
    }
    
    writeTodos(todos);
    res.json(todos[todoIndex]);
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    const todos = readTodos();
    const filteredTodos = todos.filter(todo => todo.id !== todoId);
    
    if (filteredTodos.length === todos.length) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    writeTodos(filteredTodos);
    res.json({ message: 'Todo deleted successfully' });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Todo app server running on http://localhost:${PORT}`);
});
