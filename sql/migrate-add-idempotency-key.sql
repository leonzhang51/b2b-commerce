-- Migration: add idempotency_key column to orders and unique index

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create unique index to prevent duplicate orders for same idempotency key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_index i JOIN pg_class c ON i.indrelid = c.oid WHERE c.relname = 'idx_orders_idempotency_key_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_orders_idempotency_key_unique ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;
  END IF;
END$$;
