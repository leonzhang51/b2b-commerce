# API Development Standards

## General

- Use RESTful conventions for endpoints (nouns, plural, e.g., `/products`).
- Use HTTP methods appropriately: GET (read), POST (create), PUT/PATCH (update), DELETE (remove).
- Version APIs (e.g., `/api/v1/products`).

## Request/Response

- Accept and return JSON by default.
- Validate all input data; return clear error messages.
- Use standard HTTP status codes.
- Document all endpoints (OpenAPI/Swagger recommended).

## Authentication & Authorization

- Use JWT or OAuth2 for authentication.
- Protect sensitive endpoints with middleware.
- Never expose secrets or credentials in responses.

## Error Handling

- Return consistent error structures (e.g., `{ error: string }`).
- Log errors server-side; avoid leaking stack traces to clients.

## Rate Limiting & Security

- Implement rate limiting to prevent abuse.
- Sanitize all inputs to prevent injection attacks.

## Example

```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "Widget",
  "price": 19.99
}
```
