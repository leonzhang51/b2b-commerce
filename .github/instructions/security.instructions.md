# Security Review Guidelines

## General

- Never commit secrets, credentials, or API keys to source control.
- Use environment variables for sensitive data.
- Review dependencies for vulnerabilities regularly.
- Keep all packages up to date.

## Web Application Security

- Sanitize and validate all user input.
- Use HTTPS for all network traffic.
- Set secure HTTP headers (CSP, HSTS, X-Content-Type-Options, etc.).
- Implement proper CORS policies.

## Authentication & Authorization

- Use strong password hashing (bcrypt, argon2).
- Enforce least privilege for users and services.
- Use multi-factor authentication where possible.

## Database Security

- Use parameterized queries to prevent SQL injection.
- Restrict database user permissions.
- Encrypt sensitive data at rest and in transit.

## API Security

- Require authentication for sensitive endpoints.
- Rate limit APIs to prevent abuse.
- Never expose stack traces or internal errors to clients.

## Example: .env

```
DATABASE_URL=postgres://user:password@host:5432/db
JWT_SECRET=supersecret
```
