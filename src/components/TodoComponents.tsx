import React from 'react'
import { useTodoStore } from '@/store'
import { useStoreWithHydration } from '@/hooks/useHydration'

export function TodoList() {
  const todos = useStoreWithHydration(
    () => useTodoStore((state) => state.getFilteredTodos()),
    [],
  )
  const toggleTodo = useTodoStore((state) => state.toggleTodo)
  const removeTodo = useTodoStore((state) => state.removeTodo)

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border"
        >
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={todo.completed || false}
              onChange={() => toggleTodo(todo.id)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span
              className={`${
                todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </span>
          </div>
          <button
            onClick={() => removeTodo(todo.id)}
            className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

export function TodoForm() {
  const [title, setTitle] = React.useState('')
  const addTodo = useTodoStore((state) => state.addTodo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      addTodo(title.trim())
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add
      </button>
    </form>
  )
}

export function TodoFilters() {
  const filters = useStoreWithHydration(
    () => useTodoStore((state) => state.filters),
    { showCompleted: true, searchTerm: '' },
  )
  const setShowCompleted = useTodoStore((state) => state.setShowCompleted)
  const setSearchTerm = useTodoStore((state) => state.setSearchTerm)
  const todoCount = useStoreWithHydration(
    () => useTodoStore((state) => state.getTodoCount()),
    { total: 0, completed: 0, pending: 0 },
  )

  return (
    <div className="space-y-3 mb-4">
      <input
        type="text"
        value={filters.searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search todos..."
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span>Show completed</span>
        </label>
        <div className="text-sm text-gray-600">
          {todoCount.pending} pending, {todoCount.completed} completed
        </div>
      </div>
    </div>
  )
}
