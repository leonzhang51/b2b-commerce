import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Todo, TodoFilters } from '@/types/todo'

interface TodoStore {
  readonly todos: Array<Todo>
  readonly filters: TodoFilters

  // Todo actions
  addTodo: (title: string) => void
  toggleTodo: (id: number) => void
  removeTodo: (id: number) => void
  clearCompleted: () => void

  // Filter actions
  setShowCompleted: (show: boolean) => void
  setSearchTerm: (term: string) => void

  // Computed properties
  getFilteredTodos: () => Array<Todo>
  getTodoCount: () => { total: number; completed: number; pending: number }
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [
        {
          id: 1,
          title: 'Buy groceries',
          completed: false,
          createdAt: new Date(),
        },
      ],
      filters: {
        showCompleted: true,
        searchTerm: '',
      },

      addTodo: (title) => {
        const newTodo: Todo = {
          id: Date.now(),
          title,
          completed: false,
          createdAt: new Date(),
        }
        set((state) => ({
          todos: [...state.todos, newTodo],
        }))
      },

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        })),

      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.completed),
        })),

      setShowCompleted: (show) =>
        set((state) => ({
          filters: { ...state.filters, showCompleted: show },
        })),

      setSearchTerm: (term) =>
        set((state) => ({
          filters: { ...state.filters, searchTerm: term },
        })),

      getFilteredTodos: () => {
        const { todos, filters } = get()
        return todos.filter((todo) => {
          const matchesSearch = todo.title
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
          const matchesFilter = filters.showCompleted || !todo.completed
          return matchesSearch && matchesFilter
        })
      },

      getTodoCount: () => {
        const { todos } = get()
        const completed = todos.filter((todo) => todo.completed).length
        return {
          total: todos.length,
          completed,
          pending: todos.length - completed,
        }
      },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({ todos: state.todos }),
    },
  ),
)
