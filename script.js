// Global variables
let todos = [];
let currentFilter = 'all';

// DOM elements
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const totalTodos = document.getElementById('totalTodos');
const completedTodos = document.getElementById('completedTodos');
const pendingTodos = document.getElementById('pendingTodos');
const clearCompletedBtn = document.getElementById('clearCompleted');

// API base URL - works both locally and on Vercel
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    
    // Add event listener for Enter key in input
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
});

// Load todos from server
async function loadTodos() {
    try {
        const response = await fetch(`${API_BASE}`);
        todos = await response.json();
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load todos');
    }
}

// Add new todo
async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {
        todoInput.focus();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            todoInput.value = '';
            renderTodos();
            updateStats();
            todoInput.focus();
        } else {
            throw new Error('Failed to add todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showError('Failed to add todo');
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
        const response = await fetch(`${API_BASE}?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !todo.completed })
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            todos[index] = updatedTodo;
            renderTodos();
            updateStats();
        } else {
            throw new Error('Failed to update todo');
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        showError('Failed to update todo');
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}?id=${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
            updateStats();
        } else {
            throw new Error('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo');
    }
}

// Edit todo
function editTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const todoActions = todoItem.querySelector('.todo-actions');
    
    const currentText = todoText.textContent;
    
    // Create edit input and buttons
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => saveEdit(id, editInput.value);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => cancelEdit(id);
    
    // Hide original text and actions
    todoText.style.display = 'none';
    todoActions.style.display = 'none';
    
    // Add edit elements
    todoItem.classList.add('editing');
    todoItem.appendChild(editInput);
    todoItem.appendChild(saveBtn);
    todoItem.appendChild(cancelBtn);
    
    editInput.focus();
    editInput.select();
    
    // Add Enter key listener
    editInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveEdit(id, editInput.value);
        } else if (e.key === 'Escape') {
            cancelEdit(id);
        }
    });
}

// Save edit
async function saveEdit(id, newText) {
    const text = newText.trim();
    if (!text) {
        cancelEdit(id);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            todos[index] = updatedTodo;
            renderTodos();
        } else {
            throw new Error('Failed to update todo');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo');
        cancelEdit(id);
    }
}

// Cancel edit
function cancelEdit(id) {
    renderTodos();
}

// Filter todos
function filterTodos(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTodos();
}

// Clear completed todos
async function clearCompleted() {
    const completedTodoIds = todos.filter(t => t.completed).map(t => t.id);
    
    if (completedTodoIds.length === 0) {
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${completedTodoIds.length} completed todo(s)?`)) {
        return;
    }
    
    try {
        // Delete all completed todos
        const deletePromises = completedTodoIds.map(id => 
            fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' })
        );
        
        await Promise.all(deletePromises);
        
        // Update local todos array
        todos = todos.filter(t => !t.completed);
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error clearing completed todos:', error);
        showError('Failed to clear completed todos');
    }
}

// Render todos in the DOM
function renderTodos() {
    // Filter todos based on current filter
    let filteredTodos = todos;
    switch (currentFilter) {
        case 'pending':
            filteredTodos = todos.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(t => t.completed);
            break;
    }
    
    // Clear current list
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = getEmptyMessage();
        todoList.appendChild(emptyState);
        return;
    }
    
    // Render each todo
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        
        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" onclick="editTodo(${todo.id})" title="Edit todo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    <span class="btn-text">Edit</span>
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})" title="Delete todo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    <span class="btn-text">Delete</span>
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalTodos.textContent = total;
    completedTodos.textContent = completed;
    pendingTodos.textContent = pending;
    
    // Update clear completed button
    clearCompletedBtn.disabled = completed === 0;
}

// Get empty message based on current filter
function getEmptyMessage() {
    switch (currentFilter) {
        case 'pending':
            return 'No pending todos! 🎉';
        case 'completed':
            return 'No completed todos yet.';
        default:
            return 'No todos yet. Add one above! 📝';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error message
function showError(message) {
    // Simple error display - you could enhance this with a proper toast/notification system
    alert(message);
}
