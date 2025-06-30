const fs = require('fs');
const path = require('path');

// Helper function to get todos file path
function getTodosFilePath() {
    // In Vercel, we'll use /tmp directory for file storage
    // Note: This is ephemeral storage, will reset on each deployment
    return path.join('/tmp', 'todos.json');
}

// Helper function to read todos from file
function readTodos() {
    try {
        const todosPath = getTodosFilePath();
        if (!fs.existsSync(todosPath)) {
            // Initialize with empty array if file doesn't exist
            fs.writeFileSync(todosPath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(todosPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading todos:', error);
        return [];
    }
}

// Helper function to write todos to file
function writeTodos(todos) {
    try {
        const todosPath = getTodosFilePath();
        fs.writeFileSync(todosPath, JSON.stringify(todos, null, 2));
    } catch (error) {
        console.error('Error writing todos:', error);
    }
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Get all todos
            const todos = readTodos();
            res.status(200).json(todos);
            
        } else if (req.method === 'POST') {
            // Add new todo
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
            
        } else if (req.method === 'PUT') {
            // Update todo
            const { id } = req.query;
            const { text, completed } = req.body;
            const todoId = parseInt(id);
            
            if (!id) {
                return res.status(400).json({ error: 'Todo ID is required' });
            }
            
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
            res.status(200).json(todos[todoIndex]);
            
        } else if (req.method === 'DELETE') {
            // Delete todo
            const { id } = req.query;
            const todoId = parseInt(id);
            
            if (!id) {
                return res.status(400).json({ error: 'Todo ID is required' });
            }
            
            const todos = readTodos();
            const filteredTodos = todos.filter(todo => todo.id !== todoId);
            
            if (filteredTodos.length === todos.length) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            
            writeTodos(filteredTodos);
            res.status(200).json({ message: 'Todo deleted successfully' });
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
