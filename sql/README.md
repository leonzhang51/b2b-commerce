Applying SQL migrations

This project contains standalone SQL migration files in `sql/` for manual application to your Supabase/Postgres instance.

Recommended (supabase CLI):

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli
2. Authenticate and select your project.
3. Run:

```bash
supabase db query --file sql/rpc-create-order.sql
```

Alternative (psql):

Set these env vars: PGHOST, PGUSER, PGPASSWORD, PGDATABASE (and optional PGPORT), then run:

```bash
PGPASSWORD="$PGPASSWORD" psql "postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" -f sql/rpc-create-order.sql
```

You can use the helper script in `scripts/apply-sql.sh` which prefers the supabase CLI and falls back to psql:

```bash
./scripts/apply-sql.sh sql/rpc-create-order.sql
```

Notes:

- The RPC function `create_order` requires the `orders` and `order_items` tables to exist. Apply `sql/setup-orders.sql` first if not already applied.
- The script will not alter existing tables beyond creating the RPC function.
