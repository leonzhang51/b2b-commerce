# Database Development Patterns

## Schema Design

- Use UUIDs for all primary and foreign keys.
- Normalize data where possible; denormalize for performance only when justified.
- Use `NOT NULL` and appropriate constraints (e.g., `UNIQUE`, `CHECK`).
- Add `created_at` and `updated_at` timestamps to all tables.
- Use descriptive, singular table names (e.g., `product`, `category`).

## Migrations

- Use migration tools (e.g., Supabase, Prisma, Knex) for schema changes.
- Write idempotent migration scripts.
- Always test migrations in a staging environment before production.

## Data Integrity

- Use foreign key constraints for referential integrity.
- Use `ON DELETE CASCADE` or `SET NULL` as appropriate.
- Validate data at both the database and application layers.

## Indexing

- Add indexes to columns used in joins, filters, and sorts.
- Avoid over-indexing; monitor query performance.

## Security

- Never store plain-text passwords; use strong hashing (e.g., bcrypt).
- Use parameterized queries to prevent SQL injection.
- Restrict database user permissions to the minimum required.

## Backups & Recovery

- Automate regular backups.
- Test restore procedures periodically.

## Example Table

```sql
CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```
