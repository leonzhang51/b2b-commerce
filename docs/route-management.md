# Route Management in B2B Commerce Codebase

This document provides an overview of how routes are created and updated in the B2B Commerce codebase. The project uses the TanStack Router for managing routes in a React SPA environment.

## Creating a New Route

1. **Define the Route Component**:
   - Create a new file in the `src/routes/` directory.
   - The file name should follow the convention for static or dynamic routes. For example:
     - Static route: `about.tsx`
     - Dynamic route: `product.$id.tsx`

   ```tsx
   // Example: src/routes/product.$id.tsx
   import { useParams } from '@tanstack/react-router'

   export default function ProductPage() {
     const { id } = useParams()

     return (
       <div>
         <h1>Product ID: {id}</h1>
       </div>
     )
   }
   ```

2. **Register the Route**:
   - Open the `src/router.tsx` file.
   - Add the new route to the `createFileRoute` function.

   ```tsx
   import { createFileRoute } from '@tanstack/react-router'

   export const routeTree = createFileRoute({
     path: '/product/$id',
     component: ProductPage,
   })
   ```

3. **Regenerate the Route Tree**:
   - Run the following command to regenerate the route tree:
     ```bash
     npx tsr generate
     ```
   - This ensures that the new route is included in the `routeTree.gen.ts` file.

4. **Test the Route**:
   - Start the development server and navigate to the new route.
   - Example: `http://localhost:3000/product/123`

## Updating an Existing Route

1. **Locate the Route Component**:
   - Find the corresponding file in the `src/routes/` directory.

2. **Make the Necessary Changes**:
   - Update the component logic, UI, or data fetching as needed.

   ```tsx
   // Example: Updating src/routes/product.$id.tsx
   import { useParams } from '@tanstack/react-router'

   export default function ProductPage() {
     const { id } = useParams()

     return (
       <div>
         <h1>Updated Product ID: {id}</h1>
       </div>
     )
   }
   ```

3. **Update the Route Registration (if needed)**:
   - If the route path or parameters change, update the `createFileRoute` function in `src/router.tsx`.

4. **Regenerate the Route Tree**:
   - Run the following command to update the `routeTree.gen.ts` file:
     ```bash
     npx tsr generate
     ```

5. **Test the Changes**:
   - Verify the updated route in the development environment.

## Best Practices

- **Dynamic Routes**: Use `$` in the file name to define dynamic segments (e.g., `user.$id.tsx`).
- **Type Safety**: Ensure all route parameters are type-safe by using TypeScript interfaces.
- **Regenerate Route Tree**: Always run `npx tsr generate` after adding or updating routes.
- **Testing**: Test all routes thoroughly to ensure they work as expected.

## Example Workflow

### Adding a New User Edit Route

1. Create `src/routes/edit-user.$id.tsx`:

   ```tsx
   import { useParams } from '@tanstack/react-router'

   export default function EditUserPage() {
     const { id } = useParams()

     return (
       <div>
         <h1>Edit User ID: {id}</h1>
       </div>
     )
   }
   ```

2. Register the route in `src/router.tsx`:

   ```tsx
   export const routeTree = createFileRoute({
     path: '/edit-user/$id',
     component: EditUserPage,
   })
   ```

3. Regenerate the route tree:

   ```bash
   npx tsr generate
   ```

4. Test the route: Navigate to `http://localhost:3000/edit-user/123`.

By following these steps, you can efficiently manage routes in the B2B Commerce codebase.
