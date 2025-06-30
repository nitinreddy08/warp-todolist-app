# Todo List App

A simple, clean full-stack todo list application built with Node.js, Express, and vanilla JavaScript.

## Features

- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Edit todo text inline
- ✅ Delete individual todos
- ✅ Filter todos (All, Pending, Completed)
- ✅ Clear all completed todos
- ✅ Statistics display (total, completed, pending)
- ✅ Responsive design
- ✅ Persistent storage (JSON file)

## Project Structure

```
todo-app/
├── server.js          # Express server and API routes
├── package.json       # Node.js dependencies and scripts
├── todos.json         # JSON file for data storage (created automatically)
├── public/
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles with simple color scheme
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

## Setup Instructions

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Version 14+ recommended

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The todo app will be ready to use!

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo (completion status or text)
- `DELETE /api/todos/:id` - Delete a todo

## Usage

1. **Add a todo**: Type in the input field and press Enter or click "Add"
2. **Complete a todo**: Click the checkbox next to the todo
3. **Edit a todo**: Click the "Edit" button, modify the text, then save or cancel
4. **Delete a todo**: Click the "Delete" button and confirm
5. **Filter todos**: Use the filter buttons (All, Pending, Completed)
6. **Clear completed**: Click "Clear Completed" to remove all completed todos

## Design

The app uses a simple, clean design with basic colors:
- **Primary blue** (#3498db) for active elements and focus states
- **Green** (#27ae60) for success actions and completed items
- **Orange** (#f39c12) for edit actions
- **Red** (#e74c3c) for delete actions
- **Gray tones** for text and borders
- **White background** with subtle shadows for depth

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: JSON file (simple file-based persistence)
- **Styling**: Custom CSS with responsive design

## Future Enhancements

- Add user authentication
- Implement due dates and priorities
- Add categories/tags
- Database integration (MongoDB, PostgreSQL, etc.)
- Dark mode toggle
- Drag and drop reordering
- Search functionality
- Export/import todos
