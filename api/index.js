// Simple in-memory storage for demo (resets on each deployment)
let todos = [
  {
    id: 1,
    text: "Welcome to your Todo App!",
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    text: "Add your first todo",
    completed: false,
    createdAt: new Date().toISOString()
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        // Get all todos
        res.status(200).json(todos);
        break;

      case 'POST':
        // Add new todo
        const { text } = req.body;
        if (!text) {
          return res.status(400).json({ error: 'Todo text is required' });
        }
        
        const newTodo = {
          id: Date.now(),
          text: text,
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        todos.push(newTodo);
        res.status(201).json(newTodo);
        break;

      case 'PUT':
        // Update todo
        if (!id) {
          return res.status(400).json({ error: 'Todo ID is required' });
        }
        
        const { text: newText, completed } = req.body;
        const todoId = parseInt(id);
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        
        if (todoIndex === -1) {
          return res.status(404).json({ error: 'Todo not found' });
        }
        
        if (newText !== undefined) {
          todos[todoIndex].text = newText;
        }
        if (completed !== undefined) {
          todos[todoIndex].completed = completed;
        }
        
        res.status(200).json(todos[todoIndex]);
        break;

      case 'DELETE':
        // Delete todo
        if (!id) {
          return res.status(400).json({ error: 'Todo ID is required' });
        }
        
        const deleteId = parseInt(id);
        const originalLength = todos.length;
        todos = todos.filter(todo => todo.id !== deleteId);
        
        if (todos.length === originalLength) {
          return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.status(200).json({ message: 'Todo deleted successfully' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
