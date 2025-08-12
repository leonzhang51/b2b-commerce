// Legacy file - replaced by Zustand store implementation
// This file is kept for backward compatibility but should use the new store instead

import type { Todo } from '@/types/todo'
import { useTodoStore } from '@/store/todoStore'

// Re-export the Todo type for backward compatibility
export type { Todo }

// Legacy functions that delegate to the Zustand store
export function getTodos(): Array<Todo> {
  return useTodoStore.getState().todos
}

export function addTodo(title: string): void {
  useTodoStore.getState().addTodo(title)
}

// Note: The subscription pattern is replaced by Zustand's built-in reactivity
// Components should use the useTodoStore hook directly instead of subscribeToTodos
export function subscribeToTodos(callback: (todos: Array<Todo>) => void) {
  return useTodoStore.subscribe((state) => {
    callback(state.todos)
  })
}
