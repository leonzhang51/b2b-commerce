#!/usr/bin/env bash
# apply-sql.sh - apply a SQL file to Supabase/Postgres
# Usage: ./scripts/apply-sql.sh sql/rpc-create-order.sql

set -euo pipefail
SQL_FILE="$1"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "SQL file not found: $SQL_FILE"
  exit 2
fi

# Prefer supabase CLI if available
if command -v supabase >/dev/null 2>&1; then
  echo "Applying $SQL_FILE using supabase cli"
  supabase db query --file "$SQL_FILE"
  exit 0
fi

# Fallback to psql if PGHOST/PGUSER/PGPASSWORD/PGDATABASE are set
if [[ -n "${PGHOST-}" ]]; then
  echo "Applying $SQL_FILE using psql"
  PGPASSWORD="${PGPASSWORD-}" psql "postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT-5432}/${PGDATABASE}" -f "$SQL_FILE"
  exit 0
fi

cat <<EOF
No supported method found to apply SQL.
Install supabase CLI (https://supabase.com/docs/guides/cli) or set PGHOST/PGUSER/PGPASSWORD/PGDATABASE to use psql.
EOF
exit 3
