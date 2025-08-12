# Model Context Protocol (MCP) SDK in B2B Commerce Codebase

This document provides an overview of how the Model Context Protocol (MCP) SDK is used in the B2B Commerce codebase. MCP is a framework for managing context-aware models and their interactions within the application.

## Overview

The MCP SDK is integrated into the codebase to handle tasks such as:

- Managing context-aware data models.
- Facilitating communication between components and services.
- Providing utilities for data synchronization and state management.

## Important Note

**The todo functionality in this codebase has been migrated to use Zustand for state management.** The `src/mcp-todos.ts` file now serves as a legacy compatibility layer that delegates to the new Zustand store implementation. For new features, use the Zustand stores directly.

## State Management Architecture

The application now uses **Zustand** for client-side state management alongside **TanStack Query** for server state:

- **Zustand stores**: For client-side state (cart, UI state, todos, etc.)
- **TanStack Query**: For server state (data from APIs/Supabase)
- **MCP SDK**: For specialized context management when needed

## Migration from MCP to Zustand

### Before (MCP Pattern):

```typescript
// Old MCP pattern
import { getTodos, addTodo, subscribeToTodos } from '@/mcp-todos'

const todos = getTodos()
addTodo('New task')
const unsubscribe = subscribeToTodos((updatedTodos) => {
  // Handle updates
})
```

### After (Zustand Pattern):

```typescript
// New Zustand pattern
import { useTodoStore } from '@/store'

function TodoComponent() {
  const todos = useTodoStore((state) => state.todos)
  const addTodo = useTodoStore((state) => state.addTodo)

  // Component automatically re-renders when state changes
  return (
    <div>
      {todos.map(todo => <div key={todo.id}>{todo.title}</div>)}
      <button onClick={() => addTodo('New task')}>Add Todo</button>
    </div>
  )
}
```

## Key Files and Directories

1. **`src/mcp-todos.ts`**:
   - This file contains example usage of the MCP SDK for managing a to-do list.

2. **`src/utils/mcp-handler.ts`**:
   - A utility file for handling MCP-related operations, such as initializing contexts and managing state.

3. **`src/routes/mcp.ts`**:
   - Demonstrates how MCP is used in a route to fetch and display data.

## Setting Up MCP in a New Component

1. **Import MCP Utilities**:
   - Import the necessary MCP utilities and types.

   ```typescript
   import { createContext, useContext } from 'modelcontextprotocol/sdk'
   ```

2. **Define a Context**:
   - Create a new context for your component or feature.

   ```typescript
   const MyContext = createContext({
     key: 'my-context',
     defaultValue: {},
   })
   ```

3. **Provide the Context**:
   - Wrap your component tree with the context provider.

   ```tsx
   import { MyContext } from '@/utils/mcp-handler'

   export function MyComponent() {
     return (
       <MyContext.Provider value={{ key: 'value' }}>
         <ChildComponent />
       </MyContext.Provider>
     )
   }
   ```

4. **Consume the Context**:
   - Use the context in child components to access or update the state.

   ```tsx
   import { useContext } from 'modelcontextprotocol/sdk'
   import { MyContext } from '@/utils/mcp-handler'

   export function ChildComponent() {
     const context = useContext(MyContext)

     return <div>{context.key}</div>
   }
   ```

## Example Workflow

### Managing To-Do Items with MCP

1. **Define the Context**:
   - In `src/mcp-todos.ts`, define a context for managing to-do items.

   ```typescript
   const TodoContext = createContext({
     key: 'todo-context',
     defaultValue: [],
   })
   ```

2. **Provide the Context**:
   - Wrap the to-do list component with the context provider.

   ```tsx
   export function TodoProvider({ children }: { children: React.ReactNode }) {
     const [todos, setTodos] = useState([])

     return (
       <TodoContext.Provider value={{ todos, setTodos }}>
         {children}
       </TodoContext.Provider>
     )
   }
   ```

3. **Consume the Context**:
   - Use the context in child components to display or update to-do items.

   ```tsx
   export function TodoList() {
     const { todos } = useContext(TodoContext)

     return (
       <ul>
         {todos.map((todo, index) => (
           <li key={index}>{todo}</li>
         ))}
       </ul>
     )
   }
   ```

4. **Update the Context**:
   - Provide functions to update the context state.

   ```tsx
   export function AddTodo() {
     const { todos, setTodos } = useContext(TodoContext)

     const addTodo = (newTodo: string) => {
       setTodos([...todos, newTodo])
     }

     return <button onClick={() => addTodo('New Task')}>Add To-Do</button>
   }
   ```

## Best Practices

- **Context Keys**: Use unique keys for each context to avoid conflicts.
- **Type Safety**: Define TypeScript interfaces for context values to ensure type safety.
- **Performance**: Avoid unnecessary re-renders by memoizing context values.
- **Testing**: Test context providers and consumers to ensure they work as expected.

## Additional Resources

- [MCP SDK Documentation](https://modelcontextprotocol.com/docs)
- [React Context API](https://reactjs.org/docs/context.html)

By following these guidelines, you can effectively use the MCP SDK to manage context-aware models in the B2B Commerce codebase.
