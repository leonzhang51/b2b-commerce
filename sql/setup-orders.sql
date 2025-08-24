-- Migration: create orders and order_items tables for checkout
-- Safe to re-run (uses IF NOT EXISTS where possible)

-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  company_id UUID NULL,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft', -- draft | placed | paid | cancelled | fulfilled
  shipping_address JSONB NULL,
  billing_address JSONB NULL,
  metadata JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_asin TEXT REFERENCES products(asin) ON DELETE SET NULL,
  sku TEXT NULL,
  name TEXT NULL,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC(12,2) NOT NULL GENERATED ALWAYS AS (unit_price * quantity) STORED,
  metadata JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_asin ON order_items(product_asin);

-- Trigger to update updated_at on orders
CREATE OR REPLACE FUNCTION orders_updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE t.tgname = 'orders_set_updated_at' AND c.relname = 'orders'
  ) THEN
    CREATE TRIGGER orders_set_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION orders_updated_at_trigger();
  END IF;
END$$;

-- Row Level Security (RLS) policy stubs for Supabase - adjust to your auth/role model
-- Enable RLS on orders and order_items
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: owners can select/insert/update/delete their own orders
CREATE POLICY orders_user_owner ON orders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: allow reading order_items only when parent order is accessible
CREATE POLICY order_items_parent_access ON order_items
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));

-- Note: Add admin / service policies as needed. Example (uncomment and adjust):
-- CREATE POLICY orders_admin ON orders
--   FOR ALL USING ((EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')));

-- Best practice: create indexes for common queries (user + status + created_at)
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created ON orders (user_id, status, created_at);

-- Lightweight view for order summaries (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS order_summaries AS
SELECT
  o.id,
  o.user_id,
  o.company_id,
  o.total,
  o.currency,
  o.status,
  o.created_at,
  count(oi.*) AS item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;
